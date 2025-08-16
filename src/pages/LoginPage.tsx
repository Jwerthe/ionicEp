import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';
import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonItem,
  IonLabel,
  IonInput,
  IonButton,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonToast,
  IonSpinner,
  IonIcon,
  IonGrid,
  IonRow,
  IonCol
} from '@ionic/react';
import { personCircle, lockClosed, logIn, eye, eyeOff } from 'ionicons/icons';

const LoginPage: React.FC = () => {
  const history = useHistory();
  const [user, setUser] = useState('');
  const [pass, setPass] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastColor, setToastColor] = useState('danger');

  // URLs para el proxy CORS
  const CORS_PROXY = 'https://cors-anywhere.herokuapp.com/';
  const API_BASE_URL = 'https://puce.estudioika.com/api/examen.php';

  const handleLogin = async () => {
    // Validación básica
    if (!user.trim() || !pass.trim()) {
      setToastMessage('Por favor, complete todos los campos');
      setToastColor('warning');
      setShowToast(true);
      return;
    }

    setIsLoading(true);

    try {
      // Usar proxy CORS para evitar problemas de CORS en desarrollo
      const url = `${CORS_PROXY}${API_BASE_URL}?user=${encodeURIComponent(user.trim())}&pass=${encodeURIComponent(pass.trim())}`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      console.log('Respuesta de la API:', data);

      // Verificar si la respuesta contiene datos válidos
      if (data && data.length > 0) {
        const userData = data[0];
        
        // Verificar si las credenciales son válidas
        if (userData.record === "0" || userData.record === 0) {
          setToastMessage('¡Valide Usuario! Credenciales incorrectas');
          setToastColor('danger');
          setShowToast(true);
          return;
        }
        
        // Guardar datos del usuario en localStorage
        localStorage.setItem('RECORD', userData.record);
        localStorage.setItem('ID', userData.id);
        localStorage.setItem('NAME', userData.names);
        localStorage.setItem('LASTNAME', userData.lastnames);
        localStorage.setItem('USER', userData.user);
        localStorage.setItem('MAIL', userData.mail);
        localStorage.setItem('PHONE', userData.phone);

        setToastMessage(`¡Bienvenido, ${userData.lastnames}!`);
        setToastColor('success');
        setShowToast(true);

        // Aquí puedes redirigir a la siguiente página
        setTimeout(() => {
          history.push('/attendance');
        }, 1500);

      } else {
        // Si la respuesta está vacía o no contiene datos válidos
        setToastMessage('Usuario o contraseña incorrectos');
        setToastColor('danger');
        setShowToast(true);
      }

    } catch (error) {
      console.error('Error en la petición:', error);
      
      // Manejo más específico de errores
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      if (errorMessage.includes('Failed to fetch')) {
        setToastMessage('Error de conexión. Verifique su conexión a internet.');
      } else if (errorMessage.includes('HTTP error')) {
        setToastMessage('Error del servidor. Intente nuevamente.');
      } else {
        setToastMessage('Error inesperado. Intente nuevamente.');
      }
      
      setToastColor('danger');
      setShowToast(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleLogin();
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <IonPage>
      <IonHeader style={{ display: 'none' }}>
        <IonToolbar>
          <IonTitle>Control de Asistencias</IonTitle>
        </IonToolbar>
      </IonHeader>
      
      <IonContent 
        fullscreen 
        style={{
          '--background': '#2c2c2c',
          fontFamily: '"Futura", "Century Gothic", "Arial", sans-serif'
        }}
      >
        <div style={{
          display: 'flex',
          minHeight: '80vh',
          background: '#2c2c2c',
          fontFamily: '"Futura", "Century Gothic", "Arial", sans-serif'
        }}>
          {/* Sección izquierda - Solo visible en web */}
          <div style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            padding: '2rem',
            background: 'url(/log.jpg) center/cover',
            color: 'white',
            position: 'relative'
          }} className="login-left-section">
            {/* Overlay oscuro para legibilidad del texto */}
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(0, 0, 0, 0.5)',
              zIndex: 1
            }}></div>
            
            <div style={{ 
              textAlign: 'center', 
              maxWidth: '400px',
              zIndex: 2,
              position: 'relative'
            }}>
              <h1 style={{ 
                fontSize: '3rem', 
                fontWeight: 'bold', 
                marginBottom: '1rem',
                color: 'white',
                fontFamily: '"Futura", "Century Gothic", "Arial", sans-serif'
              }}>
                Control de Asistencias
              </h1>
            </div>
          </div>

          {/* Sección derecha - Formulario */}
          <div style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '2rem',
            minHeight: '100vh',
            background: '#2c2c2c'
          }}>
            <IonCard style={{ 
              width: '100%', 
              maxWidth: '400px',
              borderRadius: '20px',
              boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
              border: 'none',
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(10px)'
            }}>
              <IonCardHeader style={{ textAlign: 'center', paddingBottom: '1rem' }}>
                {/* Avatar para mobile */}
                <div style={{ 
                  display: 'block',
                  textAlign: 'center', 
                  marginBottom: '1.5rem'
                }} className="login-mobile-avatar">
                  <div style={{
                    width: '100%',
                    height: '200px',
                    background: 'url(/log.jpg) center/cover',
                    borderRadius: '15px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 1rem',
                    position: 'relative',
                    boxShadow: '0 10px 20px rgba(0, 0, 0, 0.3)'
                  }}>
                    {/* Overlay para legibilidad */}
                    <div style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      background: 'rgba(0, 0, 0, 0.5)',
                      borderRadius: '15px'
                    }}></div>
                    <h2 style={{
                    color: 'white',
                    fontWeight: 'bold',
                    fontSize: '1.5rem',
                    zIndex: 2,
                    position: 'relative',
                    fontFamily: '"Futura", "Century Gothic", "Arial", sans-serif',
                    whiteSpace: 'normal',
                    lineHeight: '1.2',
                    textAlign: 'center'
                    }}>
                    Control de <br /> Asistencias
                    </h2>
                  </div>
                </div>
                
                <IonCardTitle style={{ 
                  fontSize: '1.8rem',
                  fontWeight: 'bold',
                  color: '#333',
                  marginBottom: '0.5rem',
                  fontFamily: '"Futura", "Century Gothic", "Arial", sans-serif'
                }}>
                </IonCardTitle>
                <p style={{ 
                  color: '#666', 
                  fontSize: '0.9rem',
                  margin: '0'
                }}>
                  Ingresa tus credenciales para continuar
                </p>
              </IonCardHeader>
              
              <IonCardContent style={{ padding: '1.5rem' }}>
                <div style={{ marginBottom: '1.5rem' }}>
                  <IonItem 
                    lines="none"
                    style={{
                      '--background': '#f8f9fa',
                      '--border-radius': '12px',
                      '--padding-start': '1rem',
                      '--padding-end': '1rem',
                      marginBottom: '1rem',
                      border: '1px solid #e9ecef'
                    }}
                  >
                    <IonIcon 
                      icon={personCircle} 
                      slot="start" 
                      style={{ color: '#555', marginRight: '0.5rem' }}
                    />
                    <IonInput
                      value={user}
                      placeholder="Usuario"
                      onIonInput={(e) => setUser(e.detail.value || '')}
                      onKeyPress={handleKeyPress}
                      clearInput
                      type="text"
                      style={{
                        '--padding-start': '0',
                        '--padding-end': '0'
                      }}
                    />
                  </IonItem>

                  <IonItem 
                    lines="none"
                    style={{
                      '--background': '#f8f9fa',
                      '--border-radius': '12px',
                      '--padding-start': '1rem',
                      '--padding-end': '1rem',
                      border: '1px solid #e9ecef'
                    }}
                  >
                    <IonIcon 
                      icon={lockClosed} 
                      slot="start" 
                      style={{ color: '#555', marginRight: '0.5rem' }}
                    />
                    <IonInput
                      value={pass}
                      placeholder="Contraseña"
                      type={showPassword ? 'text' : 'password'}
                      onIonInput={(e) => setPass(e.detail.value || '')}
                      onKeyPress={handleKeyPress}
                      clearInput
                      style={{
                        '--padding-start': '0',
                        '--padding-end': '0'
                      }}
                    />
                    <IonButton
                      fill="clear"
                      slot="end"
                      onClick={togglePasswordVisibility}
                      style={{
                        '--color': '#555',
                        '--padding-start': '0.5rem',
                        '--padding-end': '0.5rem',
                        margin: '0'
                      }}
                    >
                      <IonIcon icon={showPassword ? eyeOff : eye} />
                    </IonButton>
                  </IonItem>
                </div>

                <IonButton
                  expand="block"
                  onClick={handleLogin}
                  disabled={isLoading}
                  style={{ 
                    height: '50px',
                    '--border-radius': '12px',
                    '--background': '#555',
                    '--background-activated': '#444',
                    '--color': 'white',
                    fontWeight: 'bold',
                    fontSize: '1rem',
                    marginTop: '1rem',
                    fontFamily: '"Futura", "Century Gothic", "Arial", sans-serif'
                  }}
                >
                  {isLoading ? (
                    <>
                      <IonSpinner name="crescent" style={{ marginRight: '10px' }} />
                      Ingresando...
                    </>
                  ) : (
                    <>
                      <IonIcon icon={logIn} slot="start" />
                      Ingresar
                    </>
                  )}
                </IonButton>
              </IonCardContent>
            </IonCard>
          </div>
        </div>

        <IonToast
          isOpen={showToast}
          onDidDismiss={() => setShowToast(false)}
          message={toastMessage}
          duration={3000}
          color={toastColor}
          position="top"
        />

        <style>{`
          @media (max-width: 768px) {
            .login-left-section {
              display: none !important;
            }
            .login-mobile-avatar {
              display: block !important;
            }
          }
          
          @media (min-width: 769px) {
            .login-mobile-avatar {
              display: none !important;
            }
          }
        `}</style>
      </IonContent>
    </IonPage>
  );
};

export default LoginPage;
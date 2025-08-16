import React, { useState, useEffect } from 'react';
import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonItem,
  IonLabel,
  IonInput,
  IonButton,
  IonToast,
  IonSpinner,
  IonIcon,
  IonGrid,
  IonRow,
  IonCol,
  IonList,
  IonAvatar,
  IonChip,
  IonBadge
} from '@ionic/react';
import { 
  person, 
  time, 
  calendar, 
  checkmarkCircle, 
  refreshCircle,
  listOutline,
  fingerPrint,
  logOut,
  chevronBack,
  chevronForward
} from 'ionicons/icons';
import { useHistory } from 'react-router-dom';

// Interfaces para tipado
interface UserData {
  record: number;
  id: string;
  names: string;
  lastnames: string;
  user: string;
}

interface Attendance {
  record: number;
  date: string;
  time: string;
  join_date: string;
}

const AttendancePage: React.FC = () => {
  const history = useHistory();
  
  // Estados para datos del usuario
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loginTime, setLoginTime] = useState('');
  
  // Estados para validación de dígitos
  const [requiredPositions, setRequiredPositions] = useState<number[]>([]);
  const [digit1, setDigit1] = useState('');
  const [digit2, setDigit2] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Estados para asistencias
  const [attendances, setAttendances] = useState<Attendance[]>([]);
  const [isLoadingAttendances, setIsLoadingAttendances] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 5;
  
  // Estados para mensajes
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastColor, setToastColor] = useState('success');

  // Configuración API
  const CORS_PROXY = 'https://cors-anywhere.herokuapp.com/';
  const API_BASE_URL = 'https://puce.estudioika.com/api/examen.php';

  // Generar posiciones aleatorias para pedir dígitos
  const generateRandomPositions = (idLength: number): number[] => {
    const pos1 = Math.floor(Math.random() * idLength) + 1;
    let pos2 = Math.floor(Math.random() * idLength) + 1;
    while (pos2 === pos1) {
      pos2 = Math.floor(Math.random() * idLength) + 1;
    }
    return [pos1, pos2].sort((a, b) => a - b);
  };

  useEffect(() => {
    const loadUserData = () => {
      const record = localStorage.getItem('RECORD');
      const id = localStorage.getItem('ID');
      const names = localStorage.getItem('NAME');
      const lastnames = localStorage.getItem('LASTNAME');
      const user = localStorage.getItem('USER');

      if (!record || !id || !names) {
        setToastMessage('Error: Datos de sesión no encontrados. Vuelva a iniciar sesión.');
        setToastColor('danger');
        setShowToast(true);
        return;
      }

      const currentTime = new Date().toLocaleString('es-ES', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });

      setUserData({
        record: parseInt(record),
        id: id || '',
        names: names || '',
        lastnames: lastnames || '',
        user: user || ''
      });

      setLoginTime(currentTime);
      
      const positions = generateRandomPositions(id.length);
      setRequiredPositions(positions);
    };

    loadUserData();
  }, []);

  useEffect(() => {
    if (userData) {
      loadAttendances();
    }
  }, [userData]);

  const loadAttendances = async () => {
    if (!userData) return;

    setIsLoadingAttendances(true);
    try {
      const url = `${CORS_PROXY}${API_BASE_URL}?record=${userData.record}`;
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setAttendances(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error cargando asistencias:', error);
      setToastMessage('Error al cargar asistencias');
      setToastColor('warning');
      setShowToast(true);
    } finally {
      setIsLoadingAttendances(false);
    }
  };

  const validateDigits = () => {
    if (!userData || !requiredPositions.length) return false;

    const userDigits = userData.id.split('');
    const expectedDigit1 = userDigits[requiredPositions[0] - 1];
    const expectedDigit2 = userDigits[requiredPositions[1] - 1];

    return digit1 === expectedDigit1 && digit2 === expectedDigit2;
  };

  const handleSubmitAttendance = async () => {
    if (!digit1 || !digit2) {
      setToastMessage('Por favor, ingrese ambos dígitos');
      setToastColor('warning');
      setShowToast(true);
      return;
    }

    if (!validateDigits()) {
      setToastMessage('Dígitos incorrectos. Intente nuevamente.');
      setToastColor('danger');
      setShowToast(true);
      
      if (userData) {
        const newPositions = generateRandomPositions(userData.id.length);
        setRequiredPositions(newPositions);
      }
      setDigit1('');
      setDigit2('');
      setCurrentPage(0); 
      return;
    }

    setIsSubmitting(true);

    try {
      const url = `${CORS_PROXY}${API_BASE_URL}`;
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          record_user: userData?.record,
          join_user: userData?.record
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.message && result.message.includes('correctamente')) {
        setToastMessage('¡Asistencia registrada correctamente!');
        setToastColor('success');
        setShowToast(true);
        
        setDigit1('');
        setDigit2('');
        if (userData) {
          const newPositions = generateRandomPositions(userData.id.length);
          setRequiredPositions(newPositions);
        }
        
        setTimeout(() => {
          loadAttendances();
          setCurrentPage(0); 
        }, 1000);
      } else {
        setToastMessage('Error al registrar asistencia');
        setToastColor('danger');
        setShowToast(true);
      }

    } catch (error) {
      console.error('Error registrando asistencia:', error);
      setToastMessage('Error de conexión al registrar asistencia');
      setToastColor('danger');
      setShowToast(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = '/login';
  };

  const formatDate = (dateStr: string): string => {
    const date = new Date(dateStr);
    date.setDate(date.getDate() + 1);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}.${month}.${year}`;
  };

  const formatTime = (timeStr: string): string => {
    return timeStr || '';
  };

  const getDayName = (dateStr: string): string => {
    const date = new Date(dateStr);
    date.setDate(date.getDate() + 1);
    const day = date.getDay();
    if (day === 3) return 'Miércoles';
    if (day === 6) return 'Sábado';
    return date.toLocaleDateString('es-ES', { weekday: 'long' });
  };

  const subtractOneHour = (timeStr: string): string => {
    if (!timeStr) return '';
    const [hours, minutes, seconds] = timeStr.split(':');
    const date = new Date();
    date.setHours(parseInt(hours), parseInt(minutes), parseInt(seconds || '0'));
    date.setHours(date.getHours() - 1);
    return date.toTimeString().split(' ')[0].substring(0, 5); 
  };

  const getExpectedTime = (dateStr: string): string => {
    const date = new Date(dateStr);
    date.setDate(date.getDate() + 1);
    const day = date.getDay();
    if (day === 3) return '17:00';
    if (day === 6) return '08:00'; 
    return '08:00'; 
  };

  const getAttendanceStatus = (dateStr: string, timeStr: string): string => {
    const expectedTime = getExpectedTime(dateStr);
    const actualTime = subtractOneHour(timeStr);
    
    if (!actualTime) return 'Sin registro';
    
    const [expectedHours, expectedMinutes] = expectedTime.split(':').map(Number);
    const [actualHours, actualMinutes] = actualTime.split(':').map(Number);
    
    const expectedTotalMinutes = expectedHours * 60 + expectedMinutes;
    const actualTotalMinutes = actualHours * 60 + actualMinutes;
    
    return actualTotalMinutes <= expectedTotalMinutes ? 'En hora' : 'Atraso';
  };

  // Paginación para mobile
  const totalPages = Math.ceil(attendances.length / itemsPerPage);
  const currentAttendances = attendances.slice(
    currentPage * itemsPerPage,
    (currentPage + 1) * itemsPerPage
  );

  const nextPage = () => {
    if (currentPage < totalPages - 1) {
      setCurrentPage(currentPage + 1);
    }
  };

  const prevPage = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
    }
  };

  if (!userData) {
    return (
      <IonPage>
        <IonContent className="ion-padding" style={{ background: '#2c2c2c' }}>
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
            <IonSpinner name="crescent" color="light" />
          </div>
        </IonContent>
      </IonPage>
    );
  }

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar style={{ '--background': '#2c2c2c', '--color': 'white' }}>
          <IonChip slot="start" color="light">
            <IonIcon icon={person} />
            <IonLabel>{userData.user}</IonLabel>
          </IonChip>
          <IonButton 
            fill="clear" 
            slot="start" 
            onClick={handleLogout}
            style={{ '--color': 'white' }}
          >
            <IonIcon icon={logOut} />
          </IonButton>
        </IonToolbar>
      </IonHeader>
      
      <IonContent fullscreen style={{ '--background': '#f5f5f5' }}>
        <IonGrid>
          <IonRow>
            {/* Componente Izquierdo - Registro de Asistencia */}
            <IonCol size="12" sizeLg="4">
              <IonCard style={{ 
                borderRadius: '15px', 
                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                border: 'none'
              }}>
                {/* Imagen y título */}
                <div style={{ 
                  position: 'relative',
                  height: '150px',
                  background: 'url(/log.jpg) center/cover',
                  borderRadius: '15px 15px 0 0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'rgba(0, 0, 0, 0.5)',
                    borderRadius: '15px 15px 0 0'
                  }}></div>
                  <h2 style={{
                    color: 'white',
                    fontWeight: 'bold',
                    fontSize: '1.5rem',
                    zIndex: 2,
                    position: 'relative',
                    fontFamily: '"Futura", "Century Gothic", "Arial", sans-serif',
                    textAlign: 'center'
                  }}>
                    <IonIcon icon={fingerPrint} style={{ marginRight: '10px' }} />
                    Registro de Asistencia
                  </h2>
                </div>
                
                <IonCardContent style={{ padding: '1.5rem' }}>
                  {/* Datos del usuario */}
                  <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                    <h3 style={{ margin: '0 0 5px 0', color: '#333', fontFamily: '"Futura", "Century Gothic", "Arial", sans-serif' }}>
                      Bienvenido
                    </h3>
                    <p style={{ margin: '0', color: '#666', fontSize: '0.9rem' }}>
                      {userData.names} {userData.lastnames}
                    </p>
                  </div>

                  {/* Información de fecha y hora */}
                  <div style={{ 
                    background: '#f8f9fa', 
                    padding: '12px', 
                    borderRadius: '8px', 
                    marginBottom: '20px',
                    border: '1px solid #e9ecef'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', marginBottom: '5px' }}>
                      <IonIcon icon={calendar} style={{ color: '#555', marginRight: '8px' }} />
                      <span style={{ fontSize: '0.9rem', fontWeight: 'bold' }}>Fecha y hora de ingreso:</span>
                    </div>
                    <p style={{ margin: '0', fontSize: '0.8rem', color: '#666' }}>{loginTime}</p>
                  </div>

                  {/* Instrucciones */}
                  <div style={{ 
                    background: '#e9ecef', 
                    padding: '15px', 
                    borderRadius: '8px', 
                    margin: '20px 0',
                    textAlign: 'center'
                  }}>
                    <p style={{ margin: '0 0 10px 0', fontWeight: 'bold', fontSize: '0.9rem' }}>
                      Para registrar su asistencia ingrese los dígitos de su cédula
                    </p>
                  </div>

                  {/* Campos para dígitos - Diseño mejorado */}
                  {requiredPositions.length > 0 && (
                    <div>
                      <div style={{ 
                        display: 'flex', 
                        justifyContent: 'center', 
                        gap: '20px', 
                        marginBottom: '20px' 
                      }}>
                        {/* Primer dígito */}
                        <div style={{ textAlign: 'center' }}>
                          <div style={{
                            background: '#555',
                            color: 'white',
                            padding: '8px 12px',
                            borderRadius: '8px 8px 0 0',
                            fontSize: '0.9rem',
                            fontWeight: 'bold'
                          }}>
                            {requiredPositions[0]}
                          </div>
                          <input
                            type="number"
                            value={digit1}
                            onChange={(e) => {
                              const value = e.target.value.slice(0, 1);
                              setDigit1(value);
                            }}
                            placeholder="?"
                            min="0"
                            max="9"
                            maxLength={1}
                            style={{
                              width: '60px',
                              height: '60px',
                              border: '2px solid #ddd',
                              borderRadius: '0 0 8px 8px',
                              borderTop: 'none',
                              textAlign: 'center',
                              fontSize: '24px',
                              fontWeight: 'bold',
                              outline: 'none', color: '#555'
                            }}
                          />
                        </div>

                        {/* Segundo dígito */}
                        <div style={{ textAlign: 'center' }}>
                          <div style={{
                            background: '#555',
                            color: 'white',
                            padding: '8px 12px',
                            borderRadius: '8px 8px 0 0',
                            fontSize: '0.9rem',
                            fontWeight: 'bold'
                          }}>
                            {requiredPositions[1]}
                          </div>
                          <input
                            type="number"
                            value={digit2}
                            onChange={(e) => {
                              const value = e.target.value.slice(0, 1);
                              setDigit2(value);
                            }}
                            placeholder="?"
                            min="0"
                            max="9"
                            maxLength={1}
                            style={{
                              width: '60px',
                              height: '60px',
                              border: '2px solid #ddd',
                              borderRadius: '0 0 8px 8px',
                              borderTop: 'none',
                              textAlign: 'center',
                              fontSize: '24px',
                              fontWeight: 'bold',
                              outline: 'none', color: '#555'
                            }}
                          />
                        </div>
                      </div>

                      <IonButton
                        expand="block"
                        onClick={handleSubmitAttendance}
                        disabled={isSubmitting || !digit1 || !digit2}
                        style={{ 
                          height: '50px',
                          '--background': '#555',
                          '--background-activated': '#555',
                          '--border-radius': '12px',
                          fontFamily: '"Futura", "Century Gothic", "Arial", sans-serif'
                        }}
                      >
                        {isSubmitting ? (
                          <>
                            <IonSpinner name="crescent" />
                            <span style={{ marginLeft: '10px' }}>Registrando...</span>
                          </>
                        ) : (
                          <>
                            <IonIcon icon={checkmarkCircle} slot="start" />
                            REGISTRAR
                          </>
                        )}
                      </IonButton>
                    </div>
                  )}
                </IonCardContent>
              </IonCard>
            </IonCol>

            {/* Componente Derecho - Historial de Asistencias */}
            <IonCol size="12" sizeLg="8">
              <IonCard style={{ 
                borderRadius: '15px', 
                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                border: 'none'
              }}>
                <IonCardHeader style={{ background: '#f8f9fa' }}>
                  <IonCardTitle style={{ 
                    display: 'flex', 
                    alignItems: 'center',
                    fontFamily: '"Futura", "Century Gothic", "Arial", sans-serif'
                  }}>
                    <IonIcon icon={listOutline} style={{ marginRight: '10px' }} />
                    Historial de Asistencias
                    <IonBadge style={{ marginLeft: 'auto', background: '#555', color: 'white', padding: '8px', borderRadius: '10px' }}>
                      {attendances.length} 
                    </IonBadge>
                  </IonCardTitle>
                </IonCardHeader>
                
                <IonCardContent style={{ padding: '0' }}>
                  {isLoadingAttendances ? (
                    <div style={{ 
                      display: 'flex', 
                      justifyContent: 'center', 
                      alignItems: 'center',
                      height: '200px' 
                    }}>
                      <IonSpinner name="crescent" />
                    </div>
                  ) : (
                    <>
                      {/* Lista de asistencias */}
                      <IonList style={{ background: 'transparent' }}>
                        {currentAttendances.length === 0 ? (
                          <IonItem>
                            <IonLabel style={{ textAlign: 'center', color: '#666' }}>
                              No hay registros de asistencia
                            </IonLabel>
                          </IonItem>
                        ) : (
                          currentAttendances.map((attendance: Attendance, index: number) => (
                            <IonItem key={attendance.record || index} style={{ borderBottom: '1px solid #eee' }}>
                              <div style={{ width: '100%', padding: '10px 0' }}>
                                <div style={{ 
                                  display: 'grid', 
                                  gridTemplateColumns: '1fr 1fr 1fr 1fr 1fr',
                                  gap: '10px',
                                  alignItems: 'center',
                                  marginBottom: '5px'
                                }}>
                                  <div>
                                    <strong style={{ fontSize: '0.8rem', color: '#333' }}>Día</strong>
                                    <div style={{ fontSize: '0.75rem', color: '#666' }}>
                                      {getDayName(attendance.date)}
                                    </div>
                                  </div>
                                  <div>
                                    <strong style={{ fontSize: '0.8rem', color: '#333' }}>Fecha</strong>
                                    <div style={{ fontSize: '0.75rem', color: '#666' }}>
                                      {formatDate(attendance.date)}
                                    </div>
                                  </div>
                                  <div>
                                    <strong style={{ fontSize: '0.8rem', color: '#333' }}>Hora Registro</strong>
                                    <div style={{ fontSize: '0.75rem', color: '#666' }}>
                                      {subtractOneHour(attendance.time)}
                                    </div>
                                  </div>
                                  <div>
                                    <strong style={{ fontSize: '0.8rem', color: '#333' }}>Hora Entrada</strong>
                                    <div style={{ fontSize: '0.75rem', color: '#666' }}>
                                      {getExpectedTime(attendance.date)}
                                    </div>
                                  </div>
                                  <div>
                                    <strong style={{ fontSize: '0.8rem', color: '#333' }}>Info</strong>
                                    <IonChip 
                                      color={getAttendanceStatus(attendance.date, attendance.time) === 'Atraso' ? 'danger' : 'success'}
                                      style={{ fontSize: '0.7rem', height: '24px' }}
                                    >
                                      {getAttendanceStatus(attendance.date, attendance.time)}
                                    </IonChip>
                                  </div>
                                </div>
                              </div>
                            </IonItem>
                          ))
                        )}
                      </IonList>

                      {/* Controles de paginación para web y mobile */}
                      {totalPages > 1 && (
                        <div style={{ 
                          display: 'flex', 
                          justifyContent: 'space-between', 
                          alignItems: 'center',
                          padding: '15px',
                          background: '#f8f9fa'
                        }}>
                          <IonButton 
                            fill="clear" 
                            onClick={prevPage}
                            disabled={currentPage === 0}
                            style={{ '--color': '#555' }}
                          >
                            <IonIcon icon={chevronBack} />
                          </IonButton>
                          
                          <span style={{ fontSize: '0.9rem', color: '#666' }}>
                            {currentPage + 1} de {totalPages}
                          </span>
                          
                          <IonButton 
                            fill="clear" 
                            onClick={nextPage}
                            disabled={currentPage === totalPages - 1}
                            style={{ '--color': '#555' }}
                          >
                            <IonIcon icon={chevronForward} />
                          </IonButton>
                        </div>
                      )}

                      {/* Botón actualizar */}
                      <div style={{ padding: '15px', textAlign: 'center' }}>
                        <IonButton 
                          fill="clear" 
                          onClick={loadAttendances}
                          disabled={isLoadingAttendances}
                          style={{ '--color': '#555' }}
                        >
                          <IonIcon icon={refreshCircle} slot="start" />
                          Actualizar
                        </IonButton>
                      </div>
                    </>
                  )}
                </IonCardContent>
              </IonCard>
            </IonCol>
          </IonRow>
        </IonGrid>

        <IonToast
          isOpen={showToast}
          onDidDismiss={() => setShowToast(false)}
          message={toastMessage}
          duration={3000}
          color={toastColor}
          position="top"
        />

        <style>
          {`
            input[type="number"]::-webkit-outer-spin-button,
            input[type="number"]::-webkit-inner-spin-button {
              -webkit-appearance: none;
              margin: 0;
            }
            
            input[type="number"] {
              -moz-appearance: textfield;
            }
          `}
        </style>
      </IonContent>
    </IonPage>
  );
};

export default AttendancePage;
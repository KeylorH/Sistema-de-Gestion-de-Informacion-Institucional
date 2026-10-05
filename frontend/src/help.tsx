import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const SUPPORT_EMAIL = 'soporte@itcr.ac.cr'; 
const SUPPORT_HOURS = 'Lunes a viernes, 8:00 a.m. a 4:00 p.m.'; 

const FAQ = [
  {
    q: '¿Cómo inicio sesión?',
    a: 'Escribe tu correo institucional y tu contraseña, y presiona Iniciar sesión.',
  },
  {
    q: '¿Qué hago si olvidé mi contraseña?',
    a: 'Comunícate con el administrador del sistema para que te ayude a recuperar el acceso.',
  },
  {
    q: '¿Qué puedo consultar en el sistema?',
    a: 'Documentos, correspondencia, procedimientos, formularios, noticias y servicios institucionales del campus, según tu rol.',
  },
  {
    q: '¿Por qué no puedo ver una sección?',
    a: 'Cada sección depende de tu rol (administrador, editor o consultor). Si necesitas más permisos, solicítalos al administrador.',
  },
  {
    q: '¿Cómo puedo cambiar mi contraseña?',
    a: 'En la pantalla de inicio de sesión, haz clic en "¿Olvidaste tu contraseña?" y sigue las instrucciones para restablecerla.',
  },
  {
    q: '¿Cómo puedo actualizar mi información personal?',
    a: 'Comunícate con el administrador del sistema para actualizar tu información personal.',
  },
  {
    q: '¿Dónde puedo encontrar más información sobre el sistema?',
    a: 'Puedes consultar la documentación disponible en el portal del sistema o contactar con el administrador para obtener más detalles.',
  },
];

export function Help() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(0);

  return (
    <div className="login-page">
      <aside className="login-sidebar">
        <div className="login-sidebar-brand">
          <img className="login-sidebar-logo" src="/branding/logo-tec.svg" alt="TEC" />
          <p>Campus Tecnológico de San José</p>
          <button className="login-sidebar-active" onClick={() => navigate('/login')}>
            <span className="sidebar-home-icon">⌂</span>
            Inicio
          </button>
        </div>
        <div className="login-sidebar-footer">
          <button className="help-nav-active">
            <span>?</span>Ayuda
          </button>
          <button onClick={() => navigate('/acerca')}>
            <span>i</span>Acerca del sistema
          </button>
        </div>
      </aside>

      <main className="login-main">
        <div className="login-background-shape login-shape-1" />
        <div className="login-background-shape login-shape-2" />

        <div className="login-card help-card">
          <section className="login-form-section">
            <div className="login-heading">
              <h1>Centro de ayuda</h1>
              <p>
                Encuentra respuestas sobre el acceso y el uso del Sistema de Gestión
                de Información Institucional.
              </p>
            </div>

            <div className="help-faq">
              {FAQ.map((item, i) => (
                <div key={item.q} className={`help-item ${open === i ? 'open' : ''}`}>
                  <button onClick={() => setOpen(open === i ? -1 : i)}>
                    <span>{item.q}</span>
                    <b>{open === i ? '–' : '+'}</b>
                  </button>
                  {open === i && <p>{item.a}</p>}
                </div>
              ))}
            </div>
          </section>

          <section className="help-contact">
            <h2>¿Necesitas más ayuda?</h2>
            <div className="login-image-line" />
            <p>Si no encuentras tu respuesta, comunícate con el administrador del sistema.</p>

            <div className="help-contact-box">
              <span>Correo de soporte</span>
              <strong>{SUPPORT_EMAIL}</strong>
            </div>
            <div className="help-contact-box">
              <span>Horario de atención</span>
              <strong>{SUPPORT_HOURS}</strong>
            </div>

            <button className="help-back" onClick={() => navigate('/login')}>
              Volver a iniciar sesión
            </button>
          </section>
        </div>
      </main>
    </div>
  );
}
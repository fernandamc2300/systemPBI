export default function Sidebar() {
  return (
    <div style={styles.sidebar}>
      <h2 style={styles.logo}>SOL</h2>

      <ul style={styles.menu}>
        <li style={styles.item}>🏠 Inicio</li>
        <li style={styles.item}>👤 Usuarios</li>
        <li style={styles.item}>📊 Reportes</li>
        <li style={styles.item}>⚙️ Configuración</li>
      </ul>
    </div>
  );
}

const styles = {
  sidebar: {
    width: "220px",
    background: "#0f1a3a",
    padding: "20px",
  },
  logo: {
    marginBottom: "30px",
  },
  menu: {
    listStyle: "none",
    padding: 0,
  },
  item: {
    padding: "12px",
    borderRadius: "8px",
    cursor: "pointer",
  },
};
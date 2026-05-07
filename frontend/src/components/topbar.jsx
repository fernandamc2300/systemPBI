export default function Topbar() {
  return (
    <div style={styles.topbar}>
      <span>Bienvenida 👋</span>
      <div>🔔 ⚙️</div>
    </div>
  );
}

const styles = {
  topbar: {
    height: "60px",
    background: "#0f1a3a",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "0 20px",
    borderBottom: "1px solid rgba(255,255,255,0.1)",
  },
};
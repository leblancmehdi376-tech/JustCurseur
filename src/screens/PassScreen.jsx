export default function PassScreen({ emoji, title, name, subtitle, buttonText, onConfirm }) {
  return (
    <div className="screen pass-screen">
      <div className="pass-emoji-ring">{emoji}</div>
      <div className="pass-label">{title}</div>
      <div className="pass-name">{name}</div>
      <p className="pass-subtitle">{subtitle}</p>
      <button className="btn btn-gold btn-lg" onClick={onConfirm}>{buttonText}</button>
    </div>
  );
}

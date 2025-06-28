import '../css/Home.css';
export default function Home() {
  return (
    <div className="home-container">
      <h1 className="title">
        Bienvenue sur <span className="highlight">Votre ChatRoom</span>
      </h1>

      <p className="home-description">
        Une plateforme de discussion sécurisée, moderne et intuitive.<br />
        Rejoignez des salons, discutez en temps réel, et connectez-vous avec vos proches ou collègues.
      </p>

      <div className="home-buttons">
        <a href="/login" className="btn btn-primary">Se connecter</a>
        <a href="/register" className="btn btn-secondary">Créer un compte</a>
      </div>

      <footer className="home-footer">
        &copy; 2025 Chatroom. Tous droits réservés.
      </footer>
    </div>
  );
}

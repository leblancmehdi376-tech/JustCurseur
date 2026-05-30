import { Component } from 'react';

export default class ErrorBoundary extends Component {
  state = { error: null };

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    console.error('[ErrorBoundary]', error, info);
  }

  render() {
    if (this.state.error) {
      return (
        <div style={{
          position: 'fixed', inset: 0, background: '#06060f',
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          gap: 16, padding: 24, fontFamily: 'monospace', color: '#f0f0ff'
        }}>
          <div style={{ fontSize: 48 }}>💥</div>
          <div style={{ fontFamily: 'Chakra Petch, monospace', fontSize: 18, color: '#f5c518', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
            Erreur inattendue
          </div>
          <div style={{
            background: 'rgba(255,71,87,0.1)', border: '1px solid rgba(255,71,87,0.3)',
            borderRadius: 8, padding: '12px 16px', fontSize: 12,
            color: '#ff4757', maxWidth: 400, wordBreak: 'break-all', textAlign: 'center'
          }}>
            {this.state.error.message}
          </div>
          <button
            onClick={() => window.location.href = '/'}
            style={{
              padding: '12px 24px', background: '#f5c518', color: '#000',
              border: 'none', borderRadius: 8, fontWeight: 700,
              cursor: 'pointer', fontSize: 14, fontFamily: 'Chakra Petch, monospace',
              textTransform: 'uppercase', letterSpacing: '0.1em'
            }}
          >
            🔄 Retour à l'accueil
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

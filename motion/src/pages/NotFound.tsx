import React from 'react';
import { Link } from 'react-router-dom';

export const NotFound: React.FC = () => (
  <div className="nf wrap">
    <div>
      <div className="code">404</div>
      <div className="mono dim" style={{ letterSpacing: '.2em', fontSize: 12 }}>[NACK] no such route — 명령을 다시 확인해 주세요</div>
      <div style={{ marginTop: 24, display: 'flex', gap: 10, justifyContent: 'center' }}>
        <Link to="/" className="btn-solid">홈으로</Link>
        <Link to="/works" className="btn-ghost">Works</Link>
      </div>
    </div>
  </div>
);
export default NotFound;

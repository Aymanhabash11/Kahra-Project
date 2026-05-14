import { Link } from 'react-router-dom'
import '../styles/footer.css'

export default function Footer() {
  return (
    <footer>
      <div className="footer-top">
        <div>
          <div className="footer-brand">KAHRA<br />Studio Group</div>
          <p className="footer-tagline">
            A luxury retail concept company founded by Norah AlTamimi
            and Karin Kämpf — a subsidiary of AWN Enterprises.
          </p>
          <p className="footer-destinations">
            KAFD Riyadh · Shura Island · AMAALA
          </p>
        </div>
        <div>
          <div className="footer-col-title">Concepts</div>
          <ul className="footer-links">
            <li><Link to="/collection">All Selections</Link></li>
            <li><Link to="/collection?category=dresses">House of Nomad Stories</Link></li>
            <li><Link to="/collection?category=accessories">Ultraviolet</Link></li>
            <li><Link to="/collection?category=home">HONS Home</Link></li>
            <li><Link to="/collection?category=kimonos">Azura</Link></li>
          </ul>
        </div>
        <div>
          <div className="footer-col-title">Makers</div>
          <ul className="footer-links">
            <li><Link to="/designers?designer=Injiri">Injiri</Link></li>
            <li><Link to="/designers?designer=Gudrun+%26+Gudrun">Gudrun & Gudrun</Link></li>
            <li><Link to="/designers?designer=Kilometre+Paris">Kilometre Paris</Link></li>
            <li><Link to="/designers?designer=Marrakshi+Life">Marrakshi Life</Link></li>
            <li><Link to="/designers">All Makers</Link></li>
          </ul>
        </div>
        <div>
          <div className="footer-col-title">Studio</div>
          <ul className="footer-links">
            <li><Link to="/our-story">About KAHRA</Link></li>
            <li><Link to="/journal">Journal</Link></li>
            <li><a href="#">Careers</a></li>
            <li><a href="#">Contact</a></li>
          </ul>
        </div>
      </div>
      <div className="footer-bottom">
        <span className="footer-copy">© 2026 KAHRA Studio Group · AWN Enterprises. All rights reserved.</span>
        <div className="footer-social">
          <a href="#">Instagram</a>
          <a href="#">LinkedIn</a>
          <a href="#">Newsletter</a>
        </div>
      </div>
    </footer>
  )
}

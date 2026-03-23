import './Header.css';

function Header() {
    return (
        <header className="header">
            <h1 className="header-title">TTRPG Leveler</h1>
            <nav className="header-nav">
                <a href="/">Characters</a>
                <a href="#profile">Profile</a>
            </nav>
        </header>
    )
}

export default Header

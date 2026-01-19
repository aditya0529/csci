import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import normalizeUrl from "normalize-url";
import restController from "../utils/useRestController";

export default function Navbar({ userProfile }) {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(true);

  const apiHostName = "https://csci.swift.com"
  const logOut = (event) => {
    event.preventDefault();
    localStorage.clear();
    navigate("/logout"); //https://docs.spring.io/spring-security/reference/servlet/authentication/logout.html
  };
  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  const sidebarClass = isOpen
      ? "position-fixed top-0 bottom-0 start-0 col-md-0 bg-secondary sidebar mt-5"
      : "position-fixed top-0 bottom-0 start-0 col-md-0 bg-secondary sidebar mt-5 minimized";

  useEffect(() => {
    localStorage.setItem("sidebarState", JSON.stringify(isOpen));
  }, [isOpen]);
  useEffect(() => {
    const storedSidebarState = localStorage.getItem("sidebarState");
    if (storedSidebarState !== null) {
      setIsOpen(JSON.parse(storedSidebarState));
    }
  }, []);

  return (
      <>
        <header className="navbar sw-navbar sticky-top">
          <nav
              className="container-fluid sw-gutter flex-nowrap "
              aria-label="Main navigation"
          >
            <div className="container-fluid ps-0">
              <button
                  className="navbar-toggler text-black border-0 me-2 my-2 ms-0"
                  type="button"
                  // data-bs-toggle="collapse"
                  data-bs-toggle="offcanvas"
                  data-bs-target="#offcanvasNavbar"
                  aria-controls="offcanvasNavbar"
                  aria-expanded="false"
                  aria-label="Toggle navigation"
              >
                <span className="navbar-toggler-icon navbar-light"></span>
              </button>

              <a className="navbar-brand" href="/">
                <svg
                    version="1.1"
                    id="Layer_1"
                    xmlns="http://www.w3.org/2000/svg"
                    x="0"
                    y="0"
                    height="34.5"
                    width="100"
                    viewBox="0 0 100 34.5"
                >
                  <title>Swift Logo</title>
                  <path
                      d="M17.2 0c-3.4 0-6.7 1-9.5 2.9s-5 4.6-6.3 7.7c-1.3 3.2-1.6 6.6-1 10S2.6 27 5 29.4c2.4 2.4 5.5 4.1 8.8 4.7 3.3.7 6.8.3 9.9-1 3.1-1.3 5.8-3.5 7.7-6.4 1.9-2.8 2.9-6.2 2.9-9.6 0-4.6-1.8-9-5-12.2C26.1 1.8 21.7 0 17.2 0zm-16 17.9h5.3c0 2.4.4 4.8 1.1 7.1H3.2c-1.2-2.2-1.9-4.7-2-7.1zm16.6-9.6v-7c3 .3 5.6 3 7.2 7h-7.2zm7.6 1.2c.7 2.3 1.1 4.7 1.2 7.1h-8.8V9.5h7.6zm-8.9-8.2v7H9.3c1.6-4 4.3-6.7 7.2-7zm0 8.2v7.1H7.7c0-2.4.4-4.8 1.2-7.1h7.6zm-10 7.1H1.2c.1-2.5.8-4.9 2-7.1h4.4c-.7 2.3-1 4.7-1.1 7.1zm1.2 1.3h8.8V25H8.9c-.7-2.3-1.1-4.7-1.2-7.1zm8.8 8.3v7c-3-.3-5.6-3-7.2-7h7.2zm1.3 7v-7.1H25c-1.6 4.1-4.2 6.8-7.2 7.1zm0-8.3v-7.1h8.8c0 2.4-.4 4.8-1.2 7.1h-7.6zm10-7h5.3c-.1 2.5-.8 4.9-2 7.1h-4.4c.7-2.4 1.1-4.7 1.1-7.1zm0-1.3c0-2.4-.4-4.8-1.1-7.1h4.4c1.2 2.2 1.9 4.6 2 7.1h-5.3zm2.6-8.3h-4.1c-.4-1.1-.9-2.1-1.5-3.1-.7-1.2-1.5-2.2-2.5-3.1 3.3 1.1 6.1 3.3 8.1 6.2zM12 2.1c-.9.9-1.8 1.9-2.5 3.1-.6 1-1.1 2-1.5 3.1H3.9c2-2.9 4.8-5.1 8.1-6.2zM3.9 26.2H8c.4 1.1.9 2.1 1.5 3.1.7 1.1 1.5 2.2 2.5 3.1-3.3-1.1-6.1-3.3-8.1-6.2zm18.4 6.2c1-.9 1.8-1.9 2.5-3.1.6-1 1.1-2.1 1.5-3.1h4.1c-2 2.9-4.8 5.1-8.1 6.2zm59.2-20.1h-2.8v15.4h2.8V12.3zm-1.4-2.1c1 0 1.9-.8 1.9-1.9s-.8-1.9-1.9-1.9c-1 0-1.9.8-1.9 1.9s.9 1.9 1.9 1.9zm7.1 6.2h4.1V14h-4.1v-2.2c0-1.6 1.1-2.5 3-2.5h1.1V6.5h-1.1c-3.6 0-5.8 2-5.8 5.2v16.1h2.8V16.4zm11.7 11.4h1.1V25h-1.1c-1.9 0-3-.9-3-2.5v-6.1h4.1V14h-4.1V6.5h-2.8v16.1c0 3.1 2.2 5.1 5.8 5.2zm-35.4 0l2.8-11.5 2.8 11.5h3.2l4.3-15.4h-2.9l-3 11.8-2.9-11.8h-3.1l-2.9 11.8-3-11.8H56l4.3 15.4h3.2zm-15.2-2.6c-2.4 0-4.4-1.5-5.1-3l-2.6 1.4c1.2 2.7 4.2 4.5 7.6 4.5 4.4 0 7.5-2.5 7.5-6.1 0-8.3-11.7-4.8-11.7-9.6 0-2.1 1.8-3.1 4.3-3.1 2 0 3.8 1.1 4.9 2.5l2.2-1.9c-1.5-2.1-4.2-3.3-7.1-3.3-4.5 0-7.3 2.8-7.3 5.8 0 8.1 11.8 4.1 11.8 9.7 0 1.8-1.8 3.1-4.5 3.1z"
                      fill="#000"
                  />
                </svg>
              </a>
            </div>

            {/* <div> */}
            <div className="dropdown">
              <button
                  className="btn btn-link dropdown-toggle text-decoration-none text-black pe-0 text-capitalize"
                  type="button"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
              >
                {userProfile && userProfile.display_name} ({userProfile && userProfile.display_group}){" "}
              </button>

              <ul className="dropdown-menu">
                <li>
                  <a className="dropdown-item" href="#" onClick={logOut} style={{ pointerEvents: "none"}}>
                    Logout
                  </a>
                </li>
              </ul>
            </div>
            {/* <button
              className="btn btn-light ms-auto"
              onClick={logOut}
              type="button"
            >
              Logout
            </button> */}
            {/* </div> */}
          </nav>
        </header>
        {/* <div className={sidebarClass}>
        <div className="sidebar-sticky">
          <ul className="nav flex-column">
            <li className="nav-item">
              {isOpen ? (
                <a className="nav-link text-white" href="#">
                  Home
                </a>
              ) : (
                <a className="nav-link text-white ms-5" href="#">
                  <i className="bi bi-house-door fs-4"></i>
                </a>
              )}
            </li>
          </ul>
        </div>
      </div> */}
      </>
  );
}

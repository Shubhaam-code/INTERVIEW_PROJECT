/**
 * AuthModel.jsx — backward-compatibility shim.
 * The canonical component is now AuthModal.jsx.
 * Home.jsx and any other consumers still importing AuthModel will
 * transparently get the new AuthModal.
 */
export { default } from "./AuthModal";

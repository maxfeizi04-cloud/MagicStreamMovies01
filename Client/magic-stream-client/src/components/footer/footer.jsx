import useLanguage from "../../hooks/useLanguage";
import "./Footer.css";

const Footer = () => {
  const { t } = useLanguage();

  return (
    <footer className="site-footer">
      <div className="site-footer__inner">
        <span className="site-footer__brand">{t.common.appName}</span>
        <span className="site-footer__copy">{t.footer.copy}</span>
      </div>
    </footer>
  );
};

export default Footer;

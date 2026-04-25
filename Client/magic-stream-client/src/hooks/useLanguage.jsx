import { useContext } from "react";
import LanguageContext from "../context/LanguageProvider";

const useLanguage = () => useContext(LanguageContext);

export default useLanguage;

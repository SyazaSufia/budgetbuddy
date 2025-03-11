import "./Input.module.css";

export const Input = ({ type, placeholder, value, onChange }) => {
  return (
    <input
      className="custom-input"
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      required
    />
  );
};

export default Input;

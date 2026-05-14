interface Props extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  inputClassName?: string
}

export default function Input({ label, error, inputClassName = '', className = '', ...props }: Props) {
  return (
    <div className={`auth-field ${className}`}>
      {label && <label className="auth-label">{label}</label>}
      <input className={`auth-input${error ? ' error' : ''} ${inputClassName}`} {...props} />
      {error && <span className="auth-error">{error}</span>}
    </div>
  )
}

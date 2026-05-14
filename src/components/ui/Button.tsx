interface Props extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'outline' | 'ghost'
  children: React.ReactNode
}

export default function Button({ variant = 'primary', children, className = '', ...props }: Props) {
  const variants = {
    primary: 'btn btn-primary',
    outline: 'btn btn-outline',
    ghost: 'btn',
  }
  return (
    <button className={`${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  )
}

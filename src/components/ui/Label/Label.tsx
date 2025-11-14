import * as React from "react"

const Label = React.forwardRef<
  HTMLLabelElement,
  React.LabelHTMLAttributes<HTMLLabelElement>
>(
  ({ className, ...props }, ref) => (
    <label
      ref={ref}
      className={`text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-gray-900 dark:text-zinc-100 ${className}`}
      {...props}
    />
  )
)
Label.displayName = "Label"

export { Label }
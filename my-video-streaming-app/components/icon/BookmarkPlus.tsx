import React from 'react'

interface BookmarkPlusProps extends React.SVGProps<SVGSVGElement> {
  size?: number | string
  strokeWidth?: number | string
}

const BookmarkPlus: React.FC<BookmarkPlusProps> = ({
  size = 24,
  strokeWidth = 2,
  stroke = "currentColor",
  ...props
}) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={stroke}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z" />
      <line x1="12" y1="7" x2="12" y2="13" />
      <line x1="9" y1="10" x2="15" y2="10" />
    </svg>
  )
}

export default BookmarkPlus
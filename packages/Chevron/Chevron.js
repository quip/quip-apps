/* Copyright 2017 Quip */

// Callers should use like <Chevron color={color} /> or wrap and set
// stroke in CSS.

const defaultStyle = {
  alignItems: "center",
  display: "flex",
  flex: 1,
  justifyContent: "center",
  minWidth: 20,
  minHeight: 20
};

const Chevron = ({ color, style={} }) => {
  return (
    <div style={{
      ...defaultStyle,
      ...style,
    }}>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="14"
        height="14"
        viewBox="0 0 14 14"
      >
        <path style={{
          fill: "none",
          fillRule: "evenodd",
          stroke: color,
          strokeLinecap: "round",
          strokeLinejoin: "round",
          strokeWidth: "1.5px",
        }} d="M4,6L7,9l3-3" />
      </svg>
    </div>
  );
};

export default Chevron;

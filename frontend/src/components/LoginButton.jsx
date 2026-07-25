import styled from "styled-components";

const LoginButton = ({ children = "Login", onClick }) => {
  return (
    <StyledWrapper>
      <button onClick={onClick}>{children}</button>
    </StyledWrapper>
  );
};

const StyledWrapper = styled.div`
  button {
    position: relative;
    display: inline-block;

    padding: 8px 18px;
    text-align: center;

    font-size: 13px;
    font-weight: 600;
    letter-spacing: 0.3px;

    color: #6d28d9;
    background: rgba(255, 255, 255, 0.75);
    backdrop-filter: blur(10px);

    cursor: pointer;
    transition: all 0.35s ease;

    border: 1.5px solid #8b5cf6;
    border-radius: 999px;

    box-shadow:
      inset 0 0 0 0 #8b5cf6,
      0 4px 14px rgba(139, 92, 246, 0.12);
  }

  button:hover {
    color: white;
    box-shadow:
      inset 0 -100px 0 0 #8b5cf6,
      0 8px 22px rgba(139, 92, 246, 0.28);
    transform: translateY(-1px);
  }

  button:active {
    transform: scale(0.96);
  }
`;

export default LoginButton;
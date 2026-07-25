import styled from "styled-components";

const NavButton3D = ({ children, icon: Icon, onClick, active = false }) => {
  return (
    <StyledWrapper $active={active}>
      <button onClick={onClick}>
        {Icon && (
          <span className="icon">
            <Icon size={14} />
          </span>
        )}
        <span className="label">{children}</span>
      </button>
    </StyledWrapper>
  );
};

const StyledWrapper = styled.div`
  button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 6px;

    font-size: 13px;
    padding: 6px 14px;
    border-radius: 999px;
    font-weight: 500;

    color: ${({ $active }) => ($active ? "#4c1d95" : "#5b21b6")};
    background: ${({ $active }) =>
      $active
        ? "linear-gradient(135deg, #ddd6fe, #dbeafe)"
        : "linear-gradient(135deg, #f1e9ff, #dfeaff)"};

    border: none;
    cursor: pointer;

    box-shadow:
      inset 0 1px 0 rgba(255,255,255,0.8),
      0 1px 0 rgba(0,0,0,0.05),
      0 6px 16px rgba(139,92,246,0.16);

    transition: all 0.18s ease;
  }

  .icon {
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .label {
    display: flex;
    align-items: center;
  }

  button:hover {
    background: linear-gradient(135deg, #ddd6fe, #bfdbfe);
    transform: translateY(-1px);
  }

  button:active {
    transform: translateY(1px);
  }
`;
export default NavButton3D;

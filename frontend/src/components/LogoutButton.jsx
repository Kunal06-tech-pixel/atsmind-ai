import styled from "styled-components";

const LogoutButton = ({ onClick }) => {
  return (
    <StyledWrapper>
      <button className="Btn" onClick={onClick}>
        <div className="sign">
          <svg viewBox="0 0 512 512">
            <path d="M377.9 105.9L500.7 228.7c7.2 7.2 11.3 17.1 11.3 27.3s-4.1 20.1-11.3 27.3L377.9 406.1c-6.4 6.4-15 9.9-24 9.9c-18.7 0-33.9-15.2-33.9-33.9l0-62.1-128 0c-17.7 0-32-14.3-32-32l0-64c0-17.7 14.3-32 32-32l128 0 0-62.1c0-18.7 15.2-33.9 33.9-33.9c9 0 17.6 3.6 24 9.9zM160 96L96 96c-17.7 0-32 14.3-32 32l0 256c0 17.7 14.3 32 32 32l64 0c17.7 0 32 14.3 32 32s-14.3 32-32 32l-64 0c-53 0-96-43-96-96L0 128C0 75 43 32 96 32l64 0c17.7 0 32 14.3 32 32s-14.3 32-32 32z" />
          </svg>
        </div>
        <div className="text">Logout</div>
      </button>
    </StyledWrapper>
  );
};

const StyledWrapper = styled.div`
  .Btn {
    display: flex;
    align-items: center;
    justify-content: center;

    width: 45px;
    height: 45px;
    border-radius: 50%;
    border: none;
    cursor: pointer;
    overflow: hidden;
    transition: all 0.3s ease;
    background-color: rgb(255, 65, 65);
    position: relative;
  }

  .sign {
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .sign svg {
    width: 17px;
  }

  .sign svg path {
    fill: white;
  }

  .text {
    color: white;
    font-size: 14px;
    font-weight: 600;
    white-space: nowrap;

    position: absolute;
    opacity: 0;
    transform: translateX(10px);
    transition: all 0.3s ease;
  }

  /* ✅ FIXED HERE */
  .Btn:hover {
    width: 130px;
    border-radius: 40px;
    justify-content: center;   /* ✅ CENTER EVERYTHING */
  }

  .Btn:hover .text {
    position: static;
    opacity: 1;
    transform: translateX(0);
    margin-left: 8px;
  }

  .Btn:active {
    transform: scale(0.95);
  }
`;

export default LogoutButton;
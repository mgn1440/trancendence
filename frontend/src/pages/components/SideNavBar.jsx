const SideNavBtnSelect = ({ content }) => {
  return <button class="side-nav-btn selected">{content}</button>;
};

const SideNavBtn = ({ content }) => {
  return <button class="side-nav-btn">{content}</button>;
};

const SideNavBar = () => {
  return (
    <div class="side-nav-bar">
      <SideNavBtnSelect content="Lobby" />
      <SideNavBtn content="Lobby" />
      <SideNavBtn content="Lobby" />
    </div>
  );
};

export default SideNavBar;

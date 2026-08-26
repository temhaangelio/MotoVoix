export function PageHeader({ title, note, actions }) {
  return (
    <header className="page-header">
      <div>
        <h1 className="page-title">{title}</h1>
        <p className="page-note">{note}</p>
      </div>
      {actions}
    </header>
  );
}

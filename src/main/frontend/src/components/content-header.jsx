export default function ContentHeader({header, textColor="text-dark"}) {
    return (
        <div className="row py-1 pt-4">
            <h2 className={"fw-bold p-0 text-" + textColor}>{header}</h2>
        </div>
    );
}
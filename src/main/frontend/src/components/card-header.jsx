export default function CardHeader({ title, subtitle, optionalTag=false }) {
    return (
        // Card Title
        <div className="row py-2">
            <div className="col-md-12">
                <h4 className="fw-bold text-muted">{title}
                    {optionalTag && ( <span className="fw-light fs-5"> (Optional)</span> )}
                </h4>
                {/* Subtitle description */}
                <p className="text-muted fw-light lh-1">{subtitle}</p>
            </div>
        </div>
    );
}
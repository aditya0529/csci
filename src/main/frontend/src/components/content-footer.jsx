export default function ContentFooter({
                                        handleCancel,
                                        handlePrevious,
                                        handleNextPage,
                                        tableData,
                                        currentPageNumber,
                                        totalPages,
                                        nextButtonValue = "",
                                        nextButtonName = "",
                                        nextButtonType = "",
                                        nextButtonLabel = "Next",
                                        nextButtonDisabled = false,
                                        isSaveChangesDisabled = false, // new prop
                                        showPreviousButton = false,
                                        showProgressBar = true,
                                        showApproveButton = false,
                                        showCancelButton = true,
                                        handleApprove = "",
                                        cancelButtonLabel = "Cancel",
                                        previousButtonLabel = "Previous",
                                      }) {
  const currentProgress = (currentPageNumber / totalPages) * 100;
  return (
      <div className="container px-4 pt-3 pb-4 mb-4 bg-white shadow rounded-1">
        <div className="pb-3">
          {showProgressBar && (
              <>
                <div
                    className="progress mt-3"
                    role="progressbar"
                    aria-label="Basic example"
                    aria-valuenow="25"
                    aria-valuemin="0"
                    aria-valuemax="100"
                >
                  <div
                      className="progress-bar"
                      style={{ width: `${currentProgress}%` }}
                  ></div>
                </div>
                <div className="text-secondary fw-light pt-1">
                  {currentPageNumber} of {totalPages}
                </div>
              </>
          )}
        </div>
        <div className="d-flex justify-content-between">
          <div>
            {showCancelButton && (
                <button
                    className="btn btn-outline-secondary"
                    type="button"
                    onClick={handleCancel}
                >
                  {cancelButtonLabel}
                </button>
            )}
          </div>
          <div>
            {showPreviousButton && (
                <button
                    className="btn btn-outline-secondary me-3"
                    type="button"
                    onClick={handlePrevious}
                >
                  {previousButtonLabel}
                </button>
            )}
            <button
                className="btn btn-primary"
                type={nextButtonType}
                onClick={handleNextPage}
                disabled={nextButtonLabel === "Save Changes" ? isSaveChangesDisabled : nextButtonDisabled}
                value={nextButtonValue}
                name={nextButtonName}
            >
              {nextButtonLabel}
            </button>
            {showApproveButton && (
                <button
                    className="btn btn-secondary ms-3"
                    type="button"
                    onClick={handleApprove}
                >
                  Approve
                </button>
            )}
          </div>
        </div>
      </div>
  );
}
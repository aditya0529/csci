import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ContentHeader from "../components/content-header";
import CardHeader from "../components/card-header";
import { Card } from 'react-bootstrap';
import normalizeUrl from "normalize-url";
import {MDBDataTable, MDBDataTableV5} from 'mdbreact';
import Alert from "react-bootstrap/Alert";

export default function UserLandingPage({ userProfile }) {
    const navigate = useNavigate();
    const [items, setItems] = useState({ columns: [], rows: [] });
    const [selectedRow, setSelectRow] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const totalPages = Math.ceil(items.length / itemsPerPage);

    const [showDanger, setShowDanger] = useState(false);
    const [loading, setLoading] = useState(true);

    const session = localStorage.getItem("session");

    const apiHostName = "http://localhost:8080"

    const createNewWorkLoad = (event) => {
        event.preventDefault();
        navigate("/createEntry");
    };

    const goToPreviousPage = (event) => {
        event.preventDefault();
        setCurrentPage((prevPage) => prevPage - 1);
    };

    const goToNextPage = (event) => {
        event.preventDefault();
        setCurrentPage((prevPage) => prevPage + 1);
    };

    const handleRowSelection = (index) => {
        //setSelectRow((prevSelectedRow) => (prevSelectedRow === index ? null : index));
        //console.log(selectedRow);

        console.log(index);
        if (selectedRow === index) {
            setSelectRow(null);
            localStorage.removeItem("selectedEntry");
        } else {
            setSelectRow(index);

            if(localStorage.getItem("AccountFormData")){
                localStorage.removeItem("AccountFormData")
            }

            console.log(selectedRow);

            const selectedEntry = items[startIndex + index];

            console.log(selectedEntry);

            localStorage.setItem('selectedEntry', JSON.stringify(selectedEntry));

            console.log(localStorage);

            const apiUrl = `${apiHostName}/listItems`;

            console.log(apiUrl);
            fetch(apiUrl)
                .then(function (response) {
                    console.log(response);
                    return response.json();
                })
                .then(function (data) {
                    console.log(data);

                    const list = [];
                    //console.log(entrys)
                    console.log(list);

                    //localStorage.setItem("selectedEntry", JSON.stringify(list));
                });

            console.log("TEST");
        }
    };

    const viewEntryClickRow = (row) => {

        let queryParams = "?id=" + row['id'] + "&serId=" + row['ser_id']

        let newPage = "/viewEntry" + queryParams
        console.log("New page:" + newPage)

        navigate(newPage);
    }

    const reviewEntry = (event) => {
        event.preventDefault();
    };


    useEffect(() => {
        console.log("Getting entries....");
        const fetchEntrys = async () => {
            const fetchData = async () => {
                try {
                    const response = await fetch(apiHostName + '/listItems');
                    if (!response.ok) {
                        throw new Error("Request failed");
                    }
                    const jsonData = await response.json();
                    //setData(jsonData);
                    //console.log(jsonData);

                    for(let i=0; i<jsonData.length; i++)
                    {
                        jsonData[i]['clickEvent'] = row => viewEntryClickRow(row);
                    }

                    const tableData = {
                        columns: [
                            {
                                label: "Id",
                                field: "id"
                            },
                            {
                                label: "Finding Title",
                                field: "finding_title"
                            },
                            {
                                label: "Product Name",
                                field: "product_name"
                            },
                            {
                                label: "SER Id",
                                field: "ser_id"
                            },
                            {
                                label: "SER Link",
                                field: "ser_link"
                            },
                            {
                                label: "Due Date",
                                field: "due_date"
                            }
                        ],
                        rows: jsonData
                    }

                    setItems(tableData);
                    setLoading(false);
                    console.log("Table data set:", tableData);
                } catch (error) {
                    console.error("Error:", error);
                    setLoading(false);
                }
            };
            fetchData();
        };
        fetchEntrys();
    }, []);

    return (
        <>
            <div className="sw-hero-banner">
                <div className="container-fluid col-md-11 px-md-4 py-1 mb-4 floating-div">
                    <ContentHeader
                        header="Cloud Security Controls Interface"
                        textColor={"black"}
                    />
                </div>
            </div>
            <div className="container-fluid col-md-11 px-md-4 floating-div">
                <div className="row justify-content-sm-center mt-3">
                    <div className="container px-4 pt-3 pb-4 mb-4 bg-white shadow rounded-1">
                        <h3 className="fw-bold text-primary mt-2">Welcome!</h3>
                        <p className="py-2 text-muted">
                            Swift's CSCI application allows you to manage the suppression of AWS Security Hub findings.
                        </p>
                        {session !== "admin" && (
                            <button className="btn btn-light px-4 py-2 d-flex align-items-center justify-content-center shadow-sm"
                                    type='button'
                                    title='Create a new entry.'
                                    onClick={createNewWorkLoad}
                                    disabled={selectedRow !== null || (userProfile && userProfile.admin === false)}
                            >
                                <div>
                                    <i className="bi bi-boxes text-primary fs-1 pe-3"></i>
                                </div>
                                <div className="">
                                    <div className="fw-bold text-muted px-2">
                                        Create New Entry
                                    </div>
                                </div>
                            </button>
                        )}
                    </div>
                    <div className="container px-4 pt-3 pb-4 bg-white shadow rounded-1">


                        <Alert show={showDanger} variant="danger" onClose={() => setShowDanger(false)} dismissible>
                            <Alert.Heading>Error</Alert.Heading>
                        </Alert>


                        <div className="row">
                            <div className="col-md-12">
                                {session === "admin" ? (
                                    <>
                                        <div className="border-bottom border-dark py-1 pb-2 mb-1">
                                            <label className="fw-bold fs-4">Admin Dashboard</label>
                                        </div>
                                    </>
                                ) : (
                                    <div></div>
                                )}
                                <CardHeader
                                    title={"Suppression Entries"}
                                    subtitle={"A table of findings which should be suppressed. Click a row to view the entry in detail."}
                                />

                                <div className="scrollable-tbody mt-3 border-top bg-white pb-3">
                                    {loading ? (
                                        <div className="text-center p-4">
                                            <div className="spinner-border" role="status">
                                                <span className="visually-hidden">Loading...</span>
                                            </div>
                                        </div>
                                    ) : items.rows && items.rows.length > 0 ? (
                                        <MDBDataTableV5 //https://mdbootstrap.com/docs/b4/react/tables/datatables/#docsTabsAPI
                                            data={items}
                                            hover
                                            entriesOptions={[5, 10, 25, 50]}
                                            pagesAmount={5}
                                            fullPagination
                                            noBottomColumns
                                            responsive={true}
                                            loading={false}
                                            //autoWidth
                                            //checkbox
                                        />
                                    ) : (
                                        <div className="text-center p-4 text-muted">
                                            <p>No suppression entries found.</p>
                                            <p>Click "Create New Entry" to add your first suppression rule.</p>
                                        </div>
                                    )}
                                </div>

                                {/*<div className="d-flex justify-content-between">*/}
                                {/*  <div>*/}
                                {/*    {session === "admin" ? (*/}
                                {/*      <button*/}
                                {/*        onClick={reviewEntry}*/}
                                {/*        type="button"*/}
                                {/*        disabled={selectedRow === null}*/}
                                {/*        className="btn btn-outline-secondary me-3"*/}
                                {/*      >*/}
                                {/*        Review*/}
                                {/*      </button>*/}
                                {/*    ) : (*/}
                                {/*      <>*/}
                                {/*        /!* <button*/}
                                {/*          type="button"*/}
                                {/*          className="btn btn-primary me-3"*/}
                                {/*          onClick={createNewWorkLoad}*/}
                                {/*        >*/}
                                {/*          New Entry*/}
                                {/*        </button> *!/*/}
                                {/*        <button*/}
                                {/*            type="button"*/}
                                {/*            title="View entry details."*/}
                                {/*            onClick={viewEntry}*/}
                                {/*            disabled={selectedRow === null}*/}
                                {/*            className="btn btn-outline-primary"*/}
                                {/*        >*/}
                                {/*          View Entry*/}
                                {/*        </button>*/}
                                {/*        /!*<button*!/*/}
                                {/*        /!*  type="button"*!/*/}
                                {/*        /!*  onClick={editEntry}*!/*/}
                                {/*        /!*  disabled={!edit_review_mode || selectedRow === null}*!/*/}
                                {/*        /!*  className="btn btn-outline-secondary"*!/*/}
                                {/*        /!*>*!/*/}
                                {/*        /!*  Edit Entry*!/*/}
                                {/*        /!*</button>*!/*/}
                                {/*      </>*/}
                                {/*    )}*/}
                                {/*  </div>*/}
                                {/*  <div>*/}
                                {/*    <button*/}
                                {/*      className="btn btn-primary me-3"*/}
                                {/*      type="button"*/}
                                {/*      disabled={currentPage === 1}*/}
                                {/*      onClick={goToPreviousPage}*/}
                                {/*    >{`<`}</button>*/}
                                {/*    <span className="me-3">*/}
                                {/*      Page {currentPage} of {totalPages}*/}
                                {/*    </span>*/}
                                {/*    <button*/}
                                {/*      className="btn btn-primary "*/}
                                {/*      disabled={endIndex >= items.length}*/}
                                {/*      onClick={goToNextPage}*/}
                                {/*    >{`>`}</button>*/}
                                {/*  </div>*/}
                                {/*</div>*/}
                            </div>
                        </div>
                        <div className="container"></div>
                    </div>
                </div>
            </div>
        </>
    );
}

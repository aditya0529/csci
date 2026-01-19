import {useEffect, useState} from "react";
import {useNavigate, useSearchParams} from "react-router-dom";
import ContentHeader from "../components/content-header";
import CardHeader from "../components/card-header";
import Form from 'react-bootstrap/Form';
import normalizeUrl from 'normalize-url';
import Alert from "react-bootstrap/Alert";
import {Button, Modal} from "react-bootstrap";
import {useCookies} from "react-cookie";


export default function ViewEntry({ userProfile }) {
  const navigate = useNavigate();
  const [item, setItem] = useState([]);
  const [searchParams] = useSearchParams();
  const [showDeleteSucceeded, setShowDeleteSucceeded] = useState(false);
  const [showDeleteFailed, setShowDeleteFailed] = useState(false);

  const [showUpdateSucceeded, setShowUpdateSucceeded] = useState(false);
  const [showUpdateFailed, setShowUpdateFailed] = useState(false);

  const [showUpdateConfirmationModal, setShowUpdateConfirmationModal] = useState(false);
  const handleCloseUpdateModal = () => setShowUpdateConfirmationModal(false);

  const [showDeleteConfirmationModal, setShowDeleteConfirmationModal] = useState(false);

  const handleCloseDeleteModal = () => setShowDeleteConfirmationModal(false);

  const [isFormDirty, setIsFormDirty] = useState(false);
  const [validated, setValidated] = useState(false);

  const [id, setId] = useState(null);
  const [serId, setSerId] = useState(null);
  const [findingTitle, setFindingTitle] = useState(null);
  const [productName, setProductName] = useState(null); // Declare a state variable...
  const [serLink, setSerLink] = useState(null);
  const [dueDate, setDueDate] = useState(null);
  const [description, setDescription] = useState(null);
  const [accountInclusion, setAccountInclusion] = useState(null);
  const [accountExclusion, setAccountExclusion] = useState(null);
  const [fromSeverity, setFromSeverity] = useState(null);
  const [toSeverity, setToSeverity] = useState(null);
  const [resourceType, setResourceType] = useState(null);
  const [resourcePattern, setResourcePattern] = useState(null);
  const [extraResourcePattern, setExtraResourcePattern] = useState(null);

  // any change will mark the form dirty; reverting back to the original state will not unmark the form as dirty
  const markFormDirty = () => setIsFormDirty(true);

  const [cookies] = useCookies(['XSRF-TOKEN']);


  const session = localStorage.getItem("session");

  const apiHostName = "https://csci.swift.com"


  const handleFormSubmit = (e) => {
    e.preventDefault();

    const form = e.currentTarget;
    const isValid = form.checkValidity();
    setValidated(true);
    if (!isValid) {
      console.log("Form validation failed");
      return; // Prevent showing modal if invalid
    }
    setShowUpdateConfirmationModal(true);
  };

  const handleDeleteFormSubmit = (e) => {
    e.preventDefault();
    setShowDeleteConfirmationModal(true);
  };

  const updateEntry = async event => {
    event.preventDefault()
    let url = normalizeUrl(apiHostName + '/updateItem');
    try {
      console.log("Update button pressed.")

      let id = searchParams.get('id');
      let serId = searchParams.get('serId');

      const response = await fetch(url, {
        method: 'PUT',
        body: JSON.stringify({
          'id': id,
          'ser_id': serId,
          'finding_title': findingTitle,
          'product_name': productName,
          'ser_link': serLink,
          'due_date': dueDate,
          'description': description,
          'account_inclusion': accountInclusion,
          'account_exception': accountExclusion,
          'from_severity': fromSeverity,
          'to_severity': toSeverity,
          'resource_pattern': resourcePattern,
          'resource_type': resourceType,
          'extra_resource_pattern': extraResourcePattern
        }),
        headers: {
          'X-XSRF-TOKEN': cookies['XSRF-TOKEN'],
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });
      if (!response.ok) {
        setShowUpdateFailed(true)
        throw new Error("Request failed");
      }
      const responseData = await response;
      console.log(responseData);
      setShowUpdateSucceeded(true)
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setShowUpdateConfirmationModal(false);
      window.scrollTo({top: 0, behavior: 'smooth'}); // scroll smoothly to top of screen
      // TODO fix scroll not working
    }
    navigate("/");
  };

  const deleteEntry = async event => {
    event.preventDefault()

    let id = searchParams.get('id');
    let serId = searchParams.get('serId');

    let url = normalizeUrl(apiHostName + '/deleteItem?id=' + encodeURIComponent(id.toString()) + "&serId=" + encodeURIComponent(serId.toString()));
    try {
      console.log("Delete button pressed.")

      const response = await fetch(url, {
        method: 'DELETE',
        headers: {
          'X-XSRF-TOKEN': cookies['XSRF-TOKEN']
        }
      });
      if (!response.ok) {
        setShowDeleteFailed(true)
        throw new Error("Request failed");
      }
      const responseData = await response;
      console.log(responseData);
      setShowDeleteSucceeded(true)
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setShowDeleteConfirmationModal(false);
      window.scrollTo({top: 0, behavior: 'smooth'}); // scroll smoothly to top of screen
      // TODO fix scroll not working
    }
    navigate("/");
  };

  useEffect(() => {
    console.log("Getting item based on query params...");

    // get data from query params
    let id = searchParams.get('id');
    let serId = searchParams.get('serId');
    // setFindingTitle(searchParams.get('findingTitle'))
    // setStandardId(searchParams.get('standardId'))

    let url = normalizeUrl(apiHostName + '/getItem?id=' + encodeURIComponent(id.toString()) + "&serId=" + encodeURIComponent(serId.toString()));
    console.log('URL:')
    console.log(url)

    const fetchWorkloads = async () => {
      const fetchData = async () => {
        try {
          const response = await fetch(url);
          if (!response.ok) {
            throw new Error("Request failed");
          }
          const jsonData = await response.json();
          console.log(jsonData);
          setItem(jsonData);
          // set individual attributes
          setId(jsonData.id)
          setSerId(jsonData.ser_id)
          setFindingTitle(jsonData.finding_title)
          setProductName(jsonData.product_name)
          setSerLink(jsonData.ser_link)
          setDueDate(jsonData.due_date)
          setDescription(jsonData.description)
          setAccountInclusion(jsonData.account_inclusion)
          setAccountExclusion(jsonData.account_exception)
          setFromSeverity(jsonData.from_severity)
          setToSeverity(jsonData.to_severity)
          setResourceType(jsonData.resource_type)
          setResourcePattern(jsonData.resource_pattern)
          setExtraResourcePattern(jsonData.extra_resource_pattern)
        } catch (error) {
          console.error("Error:", error);
        }
      };
      fetchData();
    };
    fetchWorkloads();
  }, []);


  return (
      <>
        <div className="sw-hero-banner">
          <div className="container col-md-11 px-md-4 py-1 mb-4 floating-div">
            <ContentHeader
                header="Cloud Security Controls Interface"
                textColor={"black"}
            />
          </div>
        </div>
        <div className="container col-md-11 px-md-4 floating-div">
          <div className="row justify-content-sm-center mt-3">
            <div className="container px-4 pt-3 pb-4 bg-white shadow rounded-1">

              <Alert show={showUpdateSucceeded} variant="success"
                     onClose={() => setShowUpdateSucceeded(false)} dismissible>
                <Alert.Heading>Update succeeded!</Alert.Heading>
              </Alert>
              <Alert show={showUpdateFailed} variant="danger" onClose={() => setShowUpdateFailed(false)}
                     dismissible>
                <Alert.Heading>Update failed!</Alert.Heading>
              </Alert>

              <Alert show={showDeleteSucceeded} variant="success"
                     onClose={() => setShowDeleteSucceeded(false)} dismissible>
                <Alert.Heading>Deletion succeeded!</Alert.Heading>
                <p>The entry will no longer be listed on the home page.</p>
              </Alert>
              <Alert show={showDeleteFailed} variant="danger" onClose={() => setShowDeleteFailed(false)}
                     dismissible>
                <Alert.Heading>Deletion failed!</Alert.Heading>
              </Alert>

              <div className="row">
                <div className="col-md-12">
                  <CardHeader
                      title={"Entry Details"}
                  />

                  <div className="scrollable-tbody mt-3 bg-white pb-3">

                    <Form onSubmit={handleFormSubmit} onChange={markFormDirty}>

                      <Form.Group className="mb-3" controlId="formBasicProductName">
                        <Form.Label>Product Name*</Form.Label>
                        <Form.Control type="text" disabled={true} defaultValue={item.product_name}/>
                      </Form.Group>

                      <Form.Group className="mb-3" controlId="formBasicId">
                        <Form.Label>SecurityControlId or Vulnerability Id*</Form.Label>
                        <Form.Control type="text" disabled={true} defaultValue={item.id}/>
                        <Form.Text className="text-muted">[REQUIRED] The Id number as it appears in the findings based on the type ( Standards/ Vulnerability/ Config ).</Form.Text>
                      </Form.Group>

                      <Form.Group className="mb-3" controlId="formBasicFindingTitle">
                        <Form.Label>Finding Title*</Form.Label>
                        <Form.Control type="text"
                                      maxLength={256}
                                      defaultValue={item.finding_title}
                                      required
                                      onChange={(event) => setFindingTitle(event.target.value)}
                        />
                        <Form.Text className="text-muted">The title as it appears in the AWS Security Hub findings.</Form.Text>
                      </Form.Group>

                      <Form.Group className="mb-3" controlId="formBasicResourceType">
                        <Form.Label>Resource Type</Form.Label>
                        <Form.Control type="text" disabled={true} defaultValue={item.resource_type}/>
                      </Form.Group>

                      <Form.Group className="mb-3" controlId="formBasicResourcePattern">
                        <Form.Label>Resource Pattern/ Id</Form.Label>
                        <Form.Control type="text" disabled={true} defaultValue={item.resource_pattern}/>
                      </Form.Group>

                      <Form.Group className="mb-3" controlId="formBasicSerId">
                        <Form.Label>SER Id*</Form.Label>
                        <Form.Control type="text" disabled={true}
                                      defaultValue={item.ser_id}/>
                        <Form.Text className="text-muted">[REQUIRED] The Id of the Global Security-approved SER.</Form.Text>
                      </Form.Group>

                      <Form.Group className="mb-3" controlId="formBasicSerLink">
                        <Form.Label>SER Link*</Form.Label>
                        <Form.Control type="text"
                                      disabled={true}
                                      maxLength={256}
                                      placeholder="https://jira.swift.com:8443/servicedesk/customer/portal/381/GS-1057"
                                      required
                                      defaultValue={item.ser_link}
                                      onChange={(event) => setSerLink(event.target.value.trim())}
                        />
                        <Form.Text className="text-muted">[REQUIRED] A link to the Security Exception Request
                          which warrants the suppression.</Form.Text>
                      </Form.Group>

                      <Form.Group className="mb-3" controlId="formBasicDueDate">
                        <Form.Label>Due Date*</Form.Label>
                        <Form.Control type="date"
                                      required
                                      defaultValue={item.due_date}
                                      onChange={(event) => setDueDate(event.target.value.trim())}
                        />
                        <Form.Text className="text-muted">[REQUIRED] The date that the suppression will expire.</Form.Text>
                      </Form.Group>

                      <Form.Group className="mb-3" controlId="formBasicDescription">
                        <Form.Label>Description</Form.Label>
                        <Form.Control type="text"
                                      as="textarea"
                                      rows={1}
                                      maxLength={1024}
                                      placeholder="ALB deletion protection impedes progress in development environments."
                                      defaultValue={item.description}
                                      onChange={(event) => setDescription(event.target.value.trim())}
                        />
                        <Form.Text className="text-muted">A free text field for a description of the suppression entry.</Form.Text>
                      </Form.Group>

                      <Form.Group className="mb-3" controlId="formBasicAccountInclusion">
                        <Form.Label>Account Inclusion</Form.Label>
                        <Form.Control type="text"
                                      as="textarea"
                                      rows={1}
                                      maxLength={512}
                                      pattern={"^[0-9,]*$"}
                                      placeholder="123456789012,234567890123"
                                      defaultValue={item.account_inclusion}
                                      onChange={(event) => setAccountInclusion(event.target.value.trim())}
                        />
                        <Form.Text className="text-muted">A comma-separated list of account IDs for which the
                          suppression is applicable. If no IDs are specified, the suppression will apply to all accounts.</Form.Text>
                      </Form.Group>

                      <Form.Group className="mb-3" controlId="formBasicAccountException">
                        <Form.Label>Account Exception</Form.Label>
                        <Form.Control type="text"
                                      as="textarea"
                                      rows={1}
                                      maxLength={512}
                                      pattern={"^[0-9,]*$"}
                                      placeholder="987654321098,876543210987"
                                      defaultValue={item.account_exception}
                                      onChange={(event) => setAccountExclusion(event.target.value.trim())}
                        />
                        <Form.Text className="text-muted">A comma-separated list of account IDs for which the
                          suppression is not applicable.</Form.Text>
                      </Form.Group>

                      <Form.Group className="mb-3" controlId="formBasicFromSeverity">
                        <Form.Label>From Severity</Form.Label>
                        <Form.Control type="text"
                                      maxLength={16}
                                      pattern={"^[A-Z]+$"}
                                      placeholder="CRITICAL"
                                      defaultValue={item.from_severity}
                                      onChange={(event) => setFromSeverity(event.target.value.trim())}
                        />
                        <Form.Text className="text-muted">The maximum severity label of findings
                          which should be suppressed.</Form.Text>
                      </Form.Group>

                      <Form.Group className="mb-3" controlId="formBasicToSeverity">
                        <Form.Label>To Severity</Form.Label>
                        <Form.Control type="text"
                                      maxLength={16}
                                      pattern={"^[A-Z]+$"}
                                      placeholder="MEDIUM"
                                      defaultValue={item.to_severity}
                                      onChange={(event) => setToSeverity(event.target.value.trim())}
                        />
                        <Form.Text className="text-muted">The minimum severity label of findings
                          which should be suppressed.</Form.Text>
                      </Form.Group>

                      <Form.Group className="mb-3" controlId="formBasicExtraResourcePattern">
                        <Form.Label>Extra Resource Pattern</Form.Label>
                        <Form.Control type="text" disabled={true} defaultValue={item.extra_resource_pattern}/>
                        <Form.Text className="text-muted">A regex of one or more AWS resource IDs for which the suppression is applicable. Only EC2 instances and security groups are currently supported.</Form.Text>
                      </Form.Group>

                      <Button title="Return to the home page." variant="outline-secondary" style={{ float: "left" }} href={"/"}>
                        Cancel
                      </Button>

                      <Button title="Update this entry based on form data." variant="outline-warning" disabled={!isFormDirty || (userProfile && userProfile.admin === false)} type="submit" style={{ float: "right"}}>
                        Submit Edits
                      </Button>

                      <Button title="Delete this entry." variant="outline-danger" disabled={userProfile && userProfile.admin === false} onClick={handleDeleteFormSubmit} style={{ marginRight: 20 + 'px', float: "right" }}>
                        Delete Entry
                      </Button>

                    </Form>

                    <Modal show={showUpdateConfirmationModal} onHide={handleCloseUpdateModal}>
                      <Modal.Header closeButton>
                        <Modal.Title>Confirmation</Modal.Title>
                      </Modal.Header>
                      <Modal.Body>Are you sure you want to update this entry?</Modal.Body>
                      <Modal.Footer>
                        <Button variant="secondary" onClick={handleCloseUpdateModal}>
                          Cancel
                        </Button>
                        <Button variant="primary" onClick={updateEntry}>
                          Yes
                        </Button>
                      </Modal.Footer>
                    </Modal>

                    <Modal show={showDeleteConfirmationModal} onHide={handleCloseDeleteModal}>
                      <Modal.Header closeButton>
                        <Modal.Title>Confirmation</Modal.Title>
                      </Modal.Header>
                      <Modal.Body>Are you sure you want to delete this entry?</Modal.Body>
                      <Modal.Footer>
                        <Button variant="secondary" onClick={handleCloseDeleteModal}>
                          Cancel
                        </Button>
                        <Button variant="primary" onClick={deleteEntry}>
                          Yes
                        </Button>
                      </Modal.Footer>
                    </Modal>

                    {/*<button*/}
                    {/*    type="button"*/}
                    {/*    onClick={editEntry}*/}
                    {/*    className="btn btn-outline-warning"*/}
                    {/*>*/}
                    {/*    Submit Changes*/}
                    {/*</button>*/}

                    {/*<button*/}
                    {/*    type="button"*/}
                    {/*    onClick={deleteEntry}*/}
                    {/*    className="btn btn-outline-danger"*/}
                    {/*>*/}
                    {/*    Delete Entry*/}
                    {/*</button>*/}
                  </div>
                </div>
              </div>
              <div className="container"></div>
            </div>
          </div>
        </div>
      </>
  );
}

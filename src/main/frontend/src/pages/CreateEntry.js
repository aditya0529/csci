import {useRef, useState, useEffect} from "react";
import {useNavigate, useSearchParams} from "react-router-dom";
import ContentHeader from "../components/content-header";
import CardHeader from "../components/card-header";
import Form from 'react-bootstrap/Form';
import normalizeUrl from 'normalize-url';
import {Button, Modal} from "react-bootstrap";
import Alert from 'react-bootstrap/Alert';
import { useCookies } from 'react-cookie';
import restController from "../utils/useRestController";
import { validateInspectorForm, validateInspectorId, validateResourcePattern, /* validateResourceType, */ isFullWildcard } from '../services/inspectorValidation';

export default function CreateEntry({ userProfile }) {
  const navigate = useNavigate();
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showDanger, setShowDanger] = useState(false);

  const [isFormDirty, setIsFormDirty] = useState(false);
  const [labelId, setLabelId] = useState('SecurityControlId') // Default Label for Id
  const [labelIdHelp, setLabelIdHelp] = useState('[REQUIRED] SecurityControlId (E.g. ELB.6)');
  const [labelResourceId, setLabelResourceId] = useState('Resource Pattern'); // Default Label value for Resource Id
  const [placeholderResourceId, setplaceholderResourceId] = useState('arn:aws:elasticloadbalancing:*:*:loadbalancer/app/*/*'); // Default Place Holder value for Resource Id
  const [labelResourceIdHelp, setLabelResourceIdHelp] = useState(null); // Default Label value for Resource Id
  const [id, setId] = useState(null);
  const [findingTitle, setFindingTitle] = useState(null);
  const [productName, setProductName] = useState(null);
  const [serId, setSerId] = useState(null);
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
  const [isInspector, setIsInspector] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [validated, setValidated] = useState(false);

  const markFormDirty = () => setIsFormDirty(true);
  // form fields
  const [cookies] = useCookies(['XSRF-TOKEN']);

  const session = localStorage.getItem("session");

  const apiHostName = "https://csci.com"
  const PRODUCTNAMES = ["Security Hub", "Inspector", "Config", "IAM Access Analyzer", "Health", "GuardDuty"]

  const navigateHome = (event) => {
    event.preventDefault();
    navigate("/");
  };

  const validateInputs = () => {
    // Use Inspector-specific validation when Inspector is selected
    if (isInspector) {
      const result = validateInspectorForm({
        id: id || '',
        resourcePattern: resourcePattern || '',
        resourceType: resourceType || ''
      });
      
      if (!result.valid) {
        const firstError = Object.values(result.errors)[0];
        setErrorMessage(firstError);
        return false;
      }
      setErrorMessage('');
      return true;
    }
    
    return validateResourceInputs();
  }

  const validateResourceInputs = () => {

    if (isInspector && (resourcePattern.trim() === '' && resourceType.trim() === '')) {
      setErrorMessage('Please provide one of the input fields - Resource Id or Resource Type');
      return false
    }
    else {
      setErrorMessage('');
      return true
    }

  }

  const handleCloseModal = () => setShowConfirmationModal(false);

  const handleFormSubmit = (e) => {

    e.preventDefault();
    e.stopPropagation()

    const form = e.currentTarget;
    const isValid = form.checkValidity();
    const customValid = validateInputs();

    setValidated(true);

    if (!isValid || !customValid) {
      console.log("Form validation failed");
      return; // Prevent showing modal if invalid
    }
    setShowConfirmationModal(true);

  };

  const handleIdInputChange = (event) => {
    const iValue = event.target.value;
    setId(iValue);
    
    // Inspector validation
    if (isInspector && iValue.length > 0) {
      const result = validateInspectorId(iValue);
      if (!result.valid) {
        setErrorMessage(result.message);
      } else {
        setErrorMessage('');
      }
      return;
    }
    
    // original val
    if (!isInspector && iValue.length > 0) {
      const hasInvalidChars = /[\\*^$+?]/.test(iValue);
      if (hasInvalidChars) {
        setErrorMessage('Security Control Id should not have wild characters');
      }
      else {
        setErrorMessage('');
      }
    }
  };

  const handleResourceInputChange = (event) => {
    const iValue = event.target.value;
    setResourcePattern(iValue);
    
    // Inspector (wildcards depend on ID)
    if (isInspector && iValue.length > 0) {
      const isIdWildcard = isFullWildcard(id);
      const result = validateResourcePattern(iValue, isIdWildcard);
      if (!result.valid) {
        setErrorMessage(result.message);
      } else {
        setErrorMessage('');
      }
      return;
    }
    
    // Non-Inspector: original behavior (no validation - wildcards allowed)
    // const hasInvalidChars = /[\\*^$+?]/.test(iValue);
    // if (!isInspector && hasInvalidChars && iValue.length > 0) {
    //   setErrorMessage('Input cannot contain wildcard characters');
    // } else {
    //   setErrorMessage('');
    // }
  };


  const handleResourceTypeChange = (event) => {
    const iValue = event.target.value.trim();
    setResourceType(iValue);
    
    // if (isInspector && iValue.length > 0) {
    //   const result = validateResourceType(iValue);
    //   if (!result.valid) {
    //     setErrorMessage(result.message);
    //   } else {
    //     setErrorMessage('');
    //   }
    // }
  };

  const handleDropdownChange = (event) => {
    const iValue = event.target.value;
    setProductName(iValue);
    console.log(iValue);
    // Set the input to be required or not based on the dropdown value
    const isSelected = iValue === 'Inspector';
    setIsInspector(isSelected);
    setLabelId(isSelected ? 'Vulnerability Id' : 'SecurityControlId');
    setLabelIdHelp(isSelected ? '[REQUIRED] Vulnerability Id (E.g CVE-2023-29409).' : '[REQUIRED] SecurityControlId (E.g. ELB.6)');
    setLabelResourceId(isSelected ? 'Resource Id' : 'Resource Pattern');
    setplaceholderResourceId(isSelected ? 'arn:aws:kms:ca-central-1:573792771178:key/6f8881a5-a930-4c9f-af63-36a04175ff3b': 'arn:aws:elasticloadbalancing:*:*:loadbalancer/app/*/*');
    setLabelResourceIdHelp(isSelected ? 'Please provide one of the input fields - Resource Id or Resource Type' : null);
    setId('');
    setFindingTitle('');
    setResourceType('')
    setResourcePattern('')
    setSerId('');
    setSerLink('');
    setDueDate('')
    setErrorMessage(''); // Clear error message on dropdown change
  };


  const createEntry = async event => {
    event.preventDefault()
    let url = normalizeUrl(apiHostName + '/createItem');
    try {
      console.log("Create button pressed.")
      // let finding_title = event.target[0].value;
      // let standard_id = event.target[1].value;
      // let ser_link = event.target[2].value;
      // let account_inclusion = event.target[3].value;
      // let account_exception = event.target[4].value;
      // let from_severity = event.target[5].value;
      // let to_severity = event.target[6].value;
      // let resource_pattern = event.target[7].value;
      // let extra_resource_pattern = event.target[8].value;

      const response = await fetch(url, {
        method: 'POST',
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
          'resource_type': resourceType,
          'resource_pattern': resourcePattern,
          'extra_resource_pattern': extraResourcePattern
        }),
        headers: {
          'X-XSRF-TOKEN': cookies['XSRF-TOKEN'],
          'Content-Type': 'application/json'
        }
      });
      if (!response.ok) {
        setShowDanger(true)
        console.log(response)
        throw new Error("Request failed");
      }
      const responseData = await response;
      console.log(responseData);
      setShowSuccess(true)
      setId('');
      setFindingTitle('');
      setResourceType('')
      setResourcePattern('')
      setSerId('');
      setSerLink('');
      setDueDate('')
      setErrorMessage(''); // Clear error message on dropdown change
      setValidated(true);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setShowConfirmationModal(false)
      window.scrollTo({top: 0, left: 0, behavior: 'smooth'}); // scroll smoothly to top of screen
      // TODO fix scroll to top
    }
    navigate("/");
  };


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

              <Alert show={showSuccess} variant="success" onClose={() => setShowSuccess(false)} dismissible>
                <Alert.Heading>Creation succeeded!</Alert.Heading>
                <p>The entry will now be available to view on the home page.</p>
              </Alert>
              <Alert show={showDanger} variant="danger" onClose={() => setShowDanger(false)} dismissible>
                <Alert.Heading>Creation failed!</Alert.Heading>
                {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}
              </Alert>

              <div className="row">
                {/*<button type="button" className="btn-close" aria-label="Close" style={{float: 'right'}} onClick={navigateHome}></button>*/}
                <div className="col-md-12">
                  <CardHeader
                      title={"Create New Entry"}
                  />
                  <div className="scrollable-tbody mt-3 bg-white pb-3">
                    <Form noValidate onSubmit={handleFormSubmit} validated={validated} onChange={markFormDirty}>
                      {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}

                      <Form.Group className="mb-3" controlId="formBasicProductName">
                        <Form.Label>Product Name*</Form.Label>
                        <Form.Control as="select"
                                      type="select"
                                      name="productName"
                                      placeholder="Select Product Name"
                                      required
                                      value={productName}
                                      onChange={handleDropdownChange}
                        >
                          <option value="">Select Product Name</option>
                          <option value="Security Hub">Security Hub</option>
                          <option value="Inspector">Inspector</option>
                          <option value="Config">Config</option>
                          <option value="IAM Access Analyzer">IAM Access Analyzer</option>
                          <option value="Health">Health</option>
                          <option value="GuardDuty">GuardDuty</option>
                        </Form.Control>
                        <Form.Control.Feedback type="invalid">
                          Please provide a Product Name.
                        </Form.Control.Feedback>
                        <Form.Text className="text-muted">[REQUIRED] The product name as it appears in the AWS Security Hub findings.</Form.Text>
                      </Form.Group>



                      <Form.Group className="mb-3" controlId="formBasicId">
                        <Form.Label>{labelId}*</Form.Label>
                        <Form.Control type="text"
                                      name="id"
                                      maxLength={32}
                                      placeholder=""
                                      required
                            // onChange={(event) => setId(event.target.value.trim())}
                                      onChange={handleIdInputChange}
                                      value={id}
                        />
                        <Form.Control.Feedback type="invalid">
                          Please provide a Id.
                        </Form.Control.Feedback>
                        <Form.Text className="text-muted">{labelIdHelp}</Form.Text>
                      </Form.Group>


                      <Form.Group className="mb-3" controlId="formBasicFindingTitle">
                        <Form.Label>Finding Title*</Form.Label>
                        <Form.Control type="Text"
                                      name="finding_title"
                                      maxLength={1024}
                                      placeholder="Application Load Balancer deletion protection should be enabled"
                                      required
                                      onChange={(event) => setFindingTitle(event.target.value)}
                                      value={findingTitle}
                        />
                        <Form.Control.Feedback type="invalid">
                          Please provide a Finding Title.
                        </Form.Control.Feedback>
                        <Form.Text className="text-muted">[REQUIRED] The title as it appears in the AWS Security Hub findings.</Form.Text>
                      </Form.Group>

                      <Form.Group className="mb-3" controlId="formBasicResourceType">
                        <Form.Label>Resource Type</Form.Label>
                        <Form.Control type="text"
                                      name="resource_type"
                                      maxLength={1024}
                                      placeholder="AwsEcrContainerImage"
                                      onChange={handleResourceTypeChange}
                                      value={resourceType}
                        />

                        <Form.Text className="text-muted">{labelResourceIdHelp}</Form.Text>
                      </Form.Group>

                      <Form.Group className="mb-3" controlId="formBasicResourcePattern">
                        <Form.Label>{labelResourceId}</Form.Label>
                        <Form.Control type="text"
                                      as="textarea"
                                      rows={1}
                                      maxLength={1024}
                                      placeholder={placeholderResourceId}
                            //required={isInspector}
                                      onChange={handleResourceInputChange}
                                      value={resourcePattern}
                        />

                        <Form.Text className="text-muted">[Security Hub] A regex of one or more ARNs for which the suppression is applicable. [Inspector] Resource Id as it appears in the AWS Security Hub Findings</Form.Text>
                      </Form.Group>

                      <Form.Group className="mb-3" controlId="formBasicSerId">
                        <Form.Label>SER Id*</Form.Label>
                        <Form.Control type="text"
                                      maxLength={32}
                                      placeholder="GS-12345"
                                      required
                                      onChange={(event) => setSerId(event.target.value.trim())}
                                      value={serId}
                        />
                        <Form.Control.Feedback type="invalid">
                          Please provide a SER Id.
                        </Form.Control.Feedback>
                        <Form.Text className="text-muted">[REQUIRED] The Id of the Global Security-approved SER.</Form.Text>
                      </Form.Group>

                      <Form.Group className="mb-3" controlId="formBasicSerLink">
                        <Form.Label>SER Link*</Form.Label>
                        <Form.Control type="text"
                                      maxLength={256}
                                      placeholder="https://jira.swift.com:8443/servicedesk/customer/portal/381/GS-1057"
                                      required
                                      onChange={(event) => setSerLink(event.target.value.trim())}
                                      value={serLink}
                        />
                        <Form.Control.Feedback type="invalid">
                          Please provide a SER Link.
                        </Form.Control.Feedback>
                        <Form.Text className="text-muted">[REQUIRED] A link to the Security Exception Request
                          which warrants the suppression.</Form.Text>
                      </Form.Group>

                      <Form.Group className="mb-3" controlId="formBasicDueDate">
                        <Form.Label>Due Date*</Form.Label>
                        <Form.Control type="date"
                                      required
                                      placeholder="YYYY-MM-DD"
                                      dueDate={dueDate}
                                      onChange={(event) => setDueDate(event.target.value.trim())}
                        />
                        <Form.Control.Feedback type="invalid">
                          Please provide a Due Date.
                        </Form.Control.Feedback>
                        <Form.Text className="text-muted">[REQUIRED] The date that the suppression will expire.</Form.Text>
                      </Form.Group>

                      <Form.Group className="mb-3" controlId="formBasicDescription">
                        <Form.Label>Description</Form.Label>
                        <Form.Control type="text"
                                      as="textarea"
                                      rows={1}
                                      maxLength={1024}
                                      placeholder="ALB deletion protection impedes progress in development environments."
                                      value={description}
                                      onChange={(event) => setDescription(event.target.value.trim())}
                        />
                        <Form.Control.Feedback>Looks good!</Form.Control.Feedback>
                        <Form.Text className="text-muted">A free text field for a description of the suppression entry.</Form.Text>
                      </Form.Group>

                      <Form.Group className="mb-3" controlId="formBasicAccountInclusion">
                        <Form.Label>Account Inclusion</Form.Label>
                        <Form.Control type="text"
                                      as="textarea"
                                      rows={1}
                                      maxLength={1024}
                                      pattern={"^[0-9,]*$"}
                                      placeholder="123456789012,234567890123"
                                      value={accountInclusion}
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
                                      maxLength={1024}
                                      pattern={"^[0-9,]*$"}
                                      placeholder="987654321098,876543210987"
                                      value={accountExclusion}
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
                                      onChange={(event) => setToSeverity(event.target.value.trim())}
                        />

                        <Form.Text className="text-muted">The minimum severity label of findings
                          which should be suppressed.</Form.Text>
                      </Form.Group>

                      <Form.Group className="mb-3" controlId="formBasicResourcePattern">
                        <Form.Label>Resource Pattern</Form.Label>
                        <Form.Control type="text"
                                      as="textarea"
                                      rows={1}
                                      maxLength={1024}
                                      placeholder="arn:aws:elasticloadbalancing:*:*:loadbalancer/app/*/*"
                                      onChange={(event) => setResourcePattern(event.target.value.trim())}
                        />
                        <Form.Text className="text-muted">A regex of one or more ARNs for which the suppression is applicable.</Form.Text>
                      </Form.Group>

                      <Form.Group className="mb-3" controlId="formBasicExtraResourcePattern">
                        <Form.Label>Extra Resource Pattern</Form.Label>
                        <Form.Control type="text"
                                      as="textarea"
                                      rows={1}
                                      maxLength={1024}
                                      placeholder="arn:aws:elasticloadbalancing:*:*:loadbalancer/app/*/*"
                                      onChange={(event) => setExtraResourcePattern(event.target.value.trim())}
                        />

                        <Form.Text className="text-muted">A regex of one or more AWS resource IDs for which the suppression is applicable. Only EC2 instances and security groups are currently supported.</Form.Text>
                      </Form.Group>

                      {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}

                      <Button title="Return to the home page." variant="outline-secondary" style={{ float: "left" }} href={"/"}>
                        Cancel
                      </Button>

                      <Button title="Create a new entry based on form data." variant="outline-success" type="submit" disabled={!isFormDirty || (userProfile && userProfile.admin === false)} style={{ float: "right" }}>
                        Submit
                      </Button>
                    </Form>

                    <Modal show={showConfirmationModal} onHide={handleCloseModal}>
                      <Modal.Header closeButton>
                        <Modal.Title>Confirmation</Modal.Title>
                      </Modal.Header>
                      <Modal.Body>Are you sure you want to create this entry?</Modal.Body>
                      <Modal.Footer>
                        <Button variant="secondary" onClick={handleCloseModal}>
                          Cancel
                        </Button>
                        <Button variant="primary" onClick={createEntry}>
                          Yes
                        </Button>
                      </Modal.Footer>
                    </Modal>

                    {/*<button*/}
                    {/*    type="button"*/}
                    {/*    onClick={createEntry}*/}
                    {/*    className="btn btn-outline-success"*/}
                    {/*>*/}
                    {/*    Submit*/}
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

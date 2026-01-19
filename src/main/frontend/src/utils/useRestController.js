import { useCookies } from 'react-cookie';
import {useEffect, useState} from "react";

const useRestController = ({ api, method='GET', body }) => {
  const baseUrl = "[https://csci.swift.com](https://csci.swift.com)";
  const [ data, setData ] = useState(null);
  const [ isPending, setIsPending ] = useState(true);
  const [ error, setError ] = useState(null);
  const [cookies] = useCookies(['XSRF-TOKEN']);
  useEffect(() => {
    console.log('Calling API', baseUrl + api);
    const abortController = new AbortController();
    fetch(
        baseUrl + api,
        body && {
          signal: abortController.signal,
          method: method,
          headers: {
            'X-XSRF-TOKEN': cookies['XSRF-TOKEN'],
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          },
          body:JSON.stringify(body)
        }
    )
        .then(response => {
          if(! response.ok) {
            throw Error('Failed to call api');
          }
          return response.json();
        })
        .then((data) => {
          setData(data);
          setIsPending(false);
          setError(null);
        })
        .catch((err) => {
          if( err.name === 'AbortError') {
            console.log('Call aborted');
          } else {
            setIsPending(false);
            setError(err.message);
          }
        });
    return () => abortController.abort();
  }, [api]);
  return { data, isPending, error};
}
export default useRestController;

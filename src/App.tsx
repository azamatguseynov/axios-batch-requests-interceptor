import React, {useEffect} from 'react';
import './App.css';
import { axiosClient } from "./axios/apiClient";

function delay(ms: number) {
  return new Promise((resolve, reject) => {
    setTimeout(resolve, ms);
  });
}

function runTest() {
  const batchUrl = "/file-batch-api";
  axiosClient.get(batchUrl, {params: {ids: ["fileid1","fileid2"]}}).then((res) => console.log(res.data));
  axiosClient.get(batchUrl, {params: {ids: ["fileid4","fileid5"]}}).then((res) => console.log(res.data));
  axiosClient.get(batchUrl, {params: {ids: ["fileid6","fileid7"]}}).then((res) => console.log(res.data));
  axiosClient.get(batchUrl, {params: {ids: ["fileid3"]}}).catch((error) => console.error(error));

  // will produce separate request
  // by default batch interceptor has delay time = 0 and will catch only simultaneous requests
  // but you can increase delay in the config object
  delay(100).then(() => axiosClient.get(batchUrl, {params: {ids: ["fileid2"]}})).then((res) => console.log(res));
  delay(100).then(() => axiosClient.get(batchUrl, {params: {ids: ["fileid4"]}})).then((res) => console.log(res));
  delay(100).then(() => axiosClient.get(batchUrl, {params: {ids: ["fileid3"]}})).catch((error) => console.error(error));
}

function App() {

  useEffect(() => {
    runTest();
  }, [])

  return (
    <div className="App">
      Open console and network panels in devtools to see requests and responses.
    </div>
  );
}

export default App;

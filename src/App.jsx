import React, { Fragment, useState } from "react";
import {
  Checkbox,
  Container,
  Divider,
  Form,
  Header,
  TextArea,
  Input,
} from "semantic-ui-react";
import { parseInput, bufferToPrettyHex } from "./hexUtils";
import "./App.css";
import ProtobufDisplay from "./ProtobufDisplay";
import ProtobufJsonView from "./ProtobufJsonView";
import { decodeProto, trimToDecodable } from "./protobufDecoder";

function App() {
  const [hex, setHex] = useState("");

  const [hexBuffer, setHexBuffer] = useState("");
  const [trimOffset, setTrimOffset] = useState(0);
  const [trimCount, setTrimCount] = useState(0);
  const [trimHex, setTrimHex] = useState("");
  const [autoTrim, setAutoTrim] = useState(true);
  const [trimChars, setTrimChars] = useState(0);
  const [maxTrimChars, setMaxTrimChars] = useState(0);
  const [jsonView, setJsonView] = useState(false);

  const applyDecode = (b, at = autoTrim) => {
    if (at) {
      const { buffer: t, offset: o } = trimToDecodable(b, false);
      setHexBuffer(t);
      setTrimOffset(o);
      setTrimCount(o);
      setTrimHex(bufferToPrettyHex(b.slice(0, o)));
      setTrimChars(o);
    } else {
      const bytes = Math.min(trimChars, b.length);
      const t = b.slice(bytes);
      setHexBuffer(t);
      setTrimOffset(bytes);
      setTrimCount(bytes);
      setTrimHex(bufferToPrettyHex(b.slice(0, bytes)));
    }
  };

  const onHexChanged = e => {
    const v = e.target.value;
    setHex(v);
    const b = parseInput(v);
    setMaxTrimChars(b.length);
    let tb = trimChars;
    if (tb > b.length) tb = b.length;
    if (tb < 0) tb = 0;
    if (tb !== trimChars) setTrimChars(tb);
    applyDecode(b);
  };



  const fileChange = async e => {
    const file = (e.target.files || [])[0];
    if (file) {
      const b = new Uint8Array(await file.arrayBuffer());
      setHex(bufferToPrettyHex(b));
      const max = b.length;
      setMaxTrimChars(max);
      let tb = trimChars;
      if (tb > max) tb = max;
      if (tb < 0) tb = 0;
      if (tb !== trimChars) setTrimChars(tb);
      applyDecode(b);
    }
  };

  const result = hexBuffer ? (() => {
    const decoded = decodeProto(hexBuffer, false);
    return (
      <Fragment>
        <Header as="h2">Result</Header>
        {jsonView ? (
          <ProtobufJsonView value={decoded} originalBuffer={hexBuffer} baseOffset={trimOffset} trimCount={trimCount} trimHex={trimHex} />
        ) : (
          <ProtobufDisplay value={decoded} originalBuffer={hexBuffer} baseOffset={trimOffset} trimCount={trimCount} trimHex={trimHex} />
        )}
      </Fragment>
    );
  })() : null;

  return (
    <Container>
      <Header as="h1">Protobuf Decoder</Header>
      <p>
        Tool to decode Protobuf without having the original .proto files. All
        decoding is done locally via JavaScript.
      </p>
      <Form>
        <Form.Group>
          <TextArea
            placeholder="Paste Protobuf or gRPC request as hex or base64"
            onChange={onHexChanged}
            value={hex}
            data-testid="input-hex"
          />
          <Input
            action={{
              icon: 'upload',
              className: 'file-button-provider-icon',
              onClick: () => document.querySelector('#file-input-button').click()
            }}
            input={{
              id: 'file-input-button',
              hidden: true
            }}
            onChange={fileChange}
            type='file'
          />
        </Form.Group>
        <Form.Group>
          <Checkbox
            label="view result as JSON"
            checked={jsonView}
            onChange={(_, d) => setJsonView(!!d.checked)}
          />
        </Form.Group>
        <Form.Group>
          <Checkbox
            label="auto trim"
            checked={autoTrim}
            onChange={(_, d) => {
              const next = !!d.checked;
              setAutoTrim(next);
              const b = parseInput(hex);
              applyDecode(b, next);
            }}
          />
          <div style={{ marginLeft: 16, flex: 1 }}>
            <input
              type="number"
              min={0}
              max={maxTrimChars}
              step={1}
              value={trimChars}
              onChange={e => {
                if (autoTrim) setAutoTrim(false);
                let v = parseInt(e.target.value || "0", 10);
                if (isNaN(v)) v = 0;
                if (v < 0) v = 0;
                if (v > maxTrimChars) v = maxTrimChars;
                setTrimChars(v);
                const b = parseInput(hex);
                applyDecode(b, false);
              }}
              style={{ width: 160 }}
            />
            <div>Bytes Trim: {trimChars} / {maxTrimChars}</div>
          </div>
        </Form.Group>

      </Form>
      {result}
      <Divider />
    </Container>
  );
}

export default App;

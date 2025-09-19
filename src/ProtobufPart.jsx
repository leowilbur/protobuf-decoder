import React from "react";
import { Table } from "semantic-ui-react";
import { decodeProto, TYPES, typeToString } from "./protobufDecoder";
import {
  decodeFixed32,
  decodeFixed64,
  decodeStringOrBytes,
  decodeVarintParts
} from "./protobufPartDecoder";
import ProtobufDisplay from "./ProtobufDisplay";

function ProtobufVarintPart(props) {
  const { value } = props;
  const decoded = decodeVarintParts(value);

  return decoded.map((d, i) => (
    <span key={i}>
      As {d.type}: {d.value}
      <br />
    </span>
  ));
}

function ProtobufStringOrBytesPart(props) {
  const { value } = props;
  return value.value;
}

function ProtobufFixed64Part(props) {
  const { value } = props;
  const decoded = decodeFixed64(value);

  return decoded.map((d, i) => (
    <span key={i}>
      As {d.type}: {d.value}
      <br />
    </span>
  ));
}

function ProtobufFixed32Part(props) {
  const { value } = props;
  const decoded = decodeFixed32(value);

  return decoded.map((d, i) => (
    <span key={i}>
      As {d.type}: {d.value}
      <br />
    </span>
  ));
}

function getProtobufPart(part) {
  switch (part.type) {
    case TYPES.VARINT:
      return [<ProtobufVarintPart value={part.value} />];
    case TYPES.LENDELIM:
      // TODO: Support repeated field
      let decoded = decodeProto(part.value);
      if (part.value.length > 0 && decoded.leftOver.length === 0) {
        return [<ProtobufDisplay value={decoded} />, "protobuf"];
      } else {
        decoded = decodeStringOrBytes(part.value);
        return [<ProtobufStringOrBytesPart value={decoded} />, decoded.type];
      }
    case TYPES.FIXED64:
      return [<ProtobufFixed64Part value={part.value} />];
    case TYPES.FIXED32:
      return [<ProtobufFixed32Part value={part.value} />];
    case TYPES.MSG_LEN_DELIMITER:
      return ["Message length: " + part.value + " bytes"];
    default:
      return ["Unknown type"];
  }
}

function ProtobufPart(props) {
  const { part, baseOffset = 0 } = props;

  const [contents, subType] = getProtobufPart(part);
  const stringType = typeToString(part.type, subType);
  const start = part.byteRange[0] + baseOffset;
  const end = part.byteRange[1] + baseOffset;

  return (
    <Table.Row>
      <Table.Cell>{`${start}-${end}`}</Table.Cell>
      <Table.Cell>{part.index}</Table.Cell>
      <Table.Cell>{stringType}</Table.Cell>
      <Table.Cell>{contents}</Table.Cell>
    </Table.Row>
  );
}

export default ProtobufPart;

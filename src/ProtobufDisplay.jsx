import React, { Fragment } from "react";
import ProtobufPart from "./ProtobufPart";
import { Table } from "semantic-ui-react";
import { bufferToPrettyHex } from "./hexUtils";
import { TYPES } from "./protobufDecoder";

function splitDelimitedPartsInMessages(parts) {
  var messages = [];
  var currentMessage = [];
  for (var i = 0; i < parts.length; i++) {
    if (
      parts[i].type === TYPES.MSG_LEN_DELIMITER &&
      currentMessage.length > 0
    ) {
      messages.push(currentMessage);
      currentMessage = [parts[i]];
    } else {
      currentMessage.push(parts[i]);
    }
  }
  if (currentMessage.length > 0) {
    messages.push(currentMessage);
  }
  return messages;
}

function ProtobufDisplay(props) {
  const { value, baseOffset = 0, trimCount = 0, trimHex = "" } = props;

  const messages = splitDelimitedPartsInMessages(value.parts);

  const leftOver = value.leftOver.length ? (
    <p>Left over bytes: {bufferToPrettyHex(value.leftOver)}</p>
  ) : null;

  return (
    <Fragment>
      {messages.map((messageParts, i) => (
        <Table key={`message-${i}`} celled>
          <Table.Header>
            <Table.Row>
              <Table.HeaderCell>Byte Range</Table.HeaderCell>
              <Table.HeaderCell>Field Number</Table.HeaderCell>
              <Table.HeaderCell>Type</Table.HeaderCell>
              <Table.HeaderCell>Content</Table.HeaderCell>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {i === 0 && trimCount > 0 ? (
              <Table.Row>
                <Table.Cell>{`1-${trimCount}`}</Table.Cell>
                <Table.Cell></Table.Cell>
                <Table.Cell>trim</Table.Cell>
                <Table.Cell>{trimHex}</Table.Cell>
              </Table.Row>
            ) : null}
            {messageParts.map((part, j) => (
              <ProtobufPart key={`${i}-${j}`} part={part} baseOffset={baseOffset} />
            ))}
          </Table.Body>
        </Table>
      ))}
      {leftOver}
    </Fragment>
  );
}

export default ProtobufDisplay;

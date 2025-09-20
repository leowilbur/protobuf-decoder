import React from "react";
import { bufferToPrettyHex } from "./hexUtils";
import { TYPES, typeToString, decodeProto } from "./protobufDecoder";
import { decodeVarintParts, decodeFixed32, decodeFixed64, decodeStringOrBytes } from "./protobufPartDecoder";

function convertPartToJson(part, originalBuffer, baseOffset = 0) {
  const start = part.byteRange[0] + baseOffset;
  const end = part.byteRange[1] + baseOffset;
  const hexData = bufferToPrettyHex(originalBuffer.slice(part.byteRange[0], part.byteRange[1]));

  const base = {
    byteRange: `${start + 1}-${end}`,
    hexData: hexData,
    fieldNumber: part.index,
    type: typeToString(part.type)
  };

  switch (part.type) {
    case TYPES.VARINT:
      const varintDecoded = decodeVarintParts(part.value);
      base.content = {};
      varintDecoded.forEach(d => {
        base.content[d.type] = d.value;
      });
      break;

    case TYPES.LENDELIM: {
      const decoded = decodeProto(part.value);
      if (part.value.length > 0 && decoded.leftOver.length === 0) {
        base.type = "protobuf";
        base.content = convertToJson(decoded, part.value, 0);
      } else {
        const stringDecoded = decodeStringOrBytes(part.value);
        base.type = stringDecoded.type;
        base.content = stringDecoded.value;
      }
      break;
    }

    case TYPES.FIXED32:
      const fixed32Decoded = decodeFixed32(part.value);
      base.content = {};
      fixed32Decoded.forEach(d => {
        base.content[d.type] = d.value;
      });
      break;

    case TYPES.FIXED64:
      const fixed64Decoded = decodeFixed64(part.value);
      base.content = {};
      fixed64Decoded.forEach(d => {
        base.content[d.type] = d.value;
      });
      break;

    case TYPES.MSG_LEN_DELIMITER:
      base.content = `Message length: ${part.value} bytes`;
      break;

    default:
      base.content = "Unknown type";
  }

  return base;
}

function convertToJson(value, originalBuffer, baseOffset = 0) {
  const result = {
    parts: [],
    leftOver: value.leftOver.length ? bufferToPrettyHex(value.leftOver) : null
  };

  value.parts.forEach(part => {
    result.parts.push(convertPartToJson(part, originalBuffer, baseOffset));
  });

  return result;
}

function ProtobufJsonView({ value, originalBuffer, baseOffset = 0, trimCount = 0, trimHex = "" }) {
  const jsonData = convertToJson(value, originalBuffer, baseOffset);

  // Add trim information if present
  if (trimCount > 0) {
    const trimInfo = {
      byteRange: `1-${trimCount}`,
      hexData: trimHex,
      fieldNumber: null,
      type: "Bytes Trim",
      content: "Trimmed data"
    };
    jsonData.parts.unshift(trimInfo);
  }

  return (
    <div style={{ fontFamily: 'monospace', fontSize: '14px' }}>
      <pre style={{
        backgroundColor: '#f5f5f5',
        padding: '16px',
        borderRadius: '4px',
        overflow: 'auto',
        maxHeight: '600px'
      }}>
        {JSON.stringify(jsonData, null, 2)}
      </pre>
    </div>
  );
}

export default ProtobufJsonView;

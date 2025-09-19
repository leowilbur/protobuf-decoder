import { fireEvent, render, screen, getByRole } from '@testing-library/react';
import App from "./App";

describe('App', () => {
  it('renders the App component without crashing', () => {
    render(<App />)
  })

  it('renders ProtobufDisplay component when valid input is provided (auto decode)', async () => {
    render(<App />)
    const input = screen.getByTestId('input-hex')
    fireEvent.change(input, { target: { value: '0x0801' } })
    await screen.getByText('Result')
  })

  it('renders ProtobufDisplay with delimited input (auto decode)', async () => {
    render(<App />)
    const input = screen.getByTestId('input-hex')
    fireEvent.change(input, { target: { value: '0x020801' } })
    const delimitedReactCheckbox = await screen.getByTestId('parse-delimited-checkbox')
    const checkboxInput = getByRole(delimitedReactCheckbox, 'checkbox')
    fireEvent.click(checkboxInput)
    expect(checkboxInput.checked).toBe(true)
    await screen.getByText('Result')
  })
})

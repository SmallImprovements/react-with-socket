import { Component } from 'react';

export default class EmptyFormInput extends Component {
  constructor() {
    this.state = { value: '' };
  }
  render() {
    const { value } = this.state;
    const { placeholder, onSubmit, onChange = noop } = this.props;
    const onSubmit = (event) => {
      event.preventDefault();
      if (value) {
        this.props.onSubmit(value);
        this.setState({ value: '' });
      }
    };
    const onInput = (ev) => {
      const nextValue = ev.target.value;
      this.setState({ value: nextValue });
      onChange(nextValue);
    };

    return (
      <form onSubmit={ onSubmit }>
        <input value={value} onChange={onInput} placeholder={placeholder} />
      </form>
    );
  }
}


import { Component } from 'react';
import { noop } from '../util';

export default class EmptyFormInput extends Component {
  constructor() {
    super();
    this.state = { value: '' };
  }
  render() {
    const { value } = this.state;
    const { placeholder, onChange = noop } = this.props;
    const onSubmit = (event) => {
      event.preventDefault();
      event.stopPropagation();
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


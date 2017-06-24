import { Component } from 'react';
import EmptyFormInput from '../EmptyFormInput';

class ChatInput extends Component {
  type() {
    const { typing, typingTimeout } = this;
    if (!typing) { this.props.onType(true); }
    clearTimeout(this.typingTimeout);
    this.typingTimeout = setTimeout(() => this.stopTyping(), TYPING_TIMER_LENGTH);
    this.typing = true;
  }

  stopTyping() {
    this.
    clearTimeout(this.typingTimeout);
    this.props.onType(false);
    this.typing = false;
  }

  submit(msg) {
    this.stopTyping();
    onSubmit(msg);
  }

  render() {
    return (
      <EmptyFormInput
        onSubmit={(msg) => this.submit(msg) }
        onChange={() => this.type() }
      />
    )
  }
}


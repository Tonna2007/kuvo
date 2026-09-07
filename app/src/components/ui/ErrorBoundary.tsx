import { Component, type ErrorInfo, type ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

type Props = { children: ReactNode };
type State = { error: Error | null };

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Kuvo crash', error, info.componentStack);
  }

  render() {
    if (!this.state.error) return this.props.children;
    return (
      <View style={styles.wrap}>
        <Text style={styles.title}>Kuvo hit a problem</Text>
        <Text style={styles.body}>{this.state.error.message}</Text>
        <Pressable onPress={() => this.setState({ error: null })} style={styles.btn}>
          <Text style={styles.btnLabel}>Try again</Text>
        </Pressable>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    backgroundColor: '#072A1A',
    padding: 28,
    justifyContent: 'center',
  },
  title: {
    color: '#E3A857',
    fontSize: 22,
    fontWeight: '600',
    marginBottom: 12,
  },
  body: {
    color: '#BFD3C6',
    fontSize: 14,
    lineHeight: 21,
  },
  btn: {
    marginTop: 24,
    backgroundColor: '#E3A857',
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: 'center',
  },
  btnLabel: {
    color: '#072A1A',
    fontWeight: '600',
    fontSize: 15,
  },
});

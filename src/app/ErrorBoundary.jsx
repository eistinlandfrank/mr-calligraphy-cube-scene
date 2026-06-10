import { Component } from "react";

export class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = {
      error: null
    };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("App render error", error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (!this.state.error) {
      return this.props.children;
    }

    return (
      <main className="app-error-page" role="alert">
        <section className="app-error-panel">
          <p className="eyebrow">系统提示</p>
          <h1>页面暂时无法渲染</h1>
          <p>
            当前视图遇到运行错误，已被全局错误边界接管。可以重新加载页面，或返回前台演示入口继续查看。
          </p>
          <div className="route-actions">
            <button type="button" onClick={this.handleReload}>
              重新加载
            </button>
            <a href="/demo">返回前台演示</a>
          </div>
          {import.meta.env.DEV ? <pre>{this.state.error.message}</pre> : null}
        </section>
      </main>
    );
  }
}

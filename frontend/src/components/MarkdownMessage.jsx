import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import "highlight.js/styles/github-dark.css";

const cleanProps = (props) => {
  const nextProps = { ...props };
  delete nextProps.node;
  delete nextProps.inline;
  return nextProps;
};

const MarkdownMessage = ({ content }) => {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      rehypePlugins={[rehypeHighlight]}
      components={{
        h1: (props) => <h1 className="markdown-h1" {...cleanProps(props)} />,
        h2: (props) => <h2 className="markdown-h2" {...cleanProps(props)} />,
        h3: (props) => <h3 className="markdown-h3" {...cleanProps(props)} />,
        h4: (props) => <h4 className="markdown-h4" {...cleanProps(props)} />,
        p: (props) => <p className="markdown-p" {...cleanProps(props)} />,
        ul: (props) => <ul className="markdown-ul" {...cleanProps(props)} />,
        ol: (props) => <ol className="markdown-ol" {...cleanProps(props)} />,
        li: (props) => <li className="markdown-li" {...cleanProps(props)} />,
        code: (props) => {
          const { inline, className, children } = props;
          const nextProps = cleanProps(props);

          return inline ? (
            <code className="markdown-inline-code" {...nextProps}>
              {children}
            </code>
          ) : (
            <code className={`markdown-code-block ${className || ""}`} {...nextProps}>
              {children}
            </code>
          );
        },
        pre: (props) => <pre className="markdown-pre" {...cleanProps(props)} />,
        a: (props) => (
          <a
            className="markdown-link"
            target="_blank"
            rel="noopener noreferrer"
            {...cleanProps(props)}
          />
        ),
        blockquote: (props) => (
          <blockquote className="markdown-blockquote" {...cleanProps(props)} />
        ),
        table: (props) => (
          <div className="markdown-table-wrapper">
            <table className="markdown-table" {...cleanProps(props)} />
          </div>
        ),
        thead: (props) => <thead className="markdown-thead" {...cleanProps(props)} />,
        tbody: (props) => <tbody className="markdown-tbody" {...cleanProps(props)} />,
        tr: (props) => <tr className="markdown-tr" {...cleanProps(props)} />,
        th: (props) => <th className="markdown-th" {...cleanProps(props)} />,
        td: (props) => <td className="markdown-td" {...cleanProps(props)} />,
        hr: (props) => <hr className="markdown-hr" {...cleanProps(props)} />,
        strong: (props) => (
          <strong className="markdown-strong" {...cleanProps(props)} />
        ),
        em: (props) => <em className="markdown-em" {...cleanProps(props)} />,
      }}
    >
      {content}
    </ReactMarkdown>
  );
};

export default MarkdownMessage;

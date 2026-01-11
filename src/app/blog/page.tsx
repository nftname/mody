export default function BlogPage() {
  return (
    <div style={{ background: '#1E1E1E', minHeight: '100vh', color: '#fff', padding: '100px 20px' }}>
      <div className="container">
        <h1 className="mb-5 border-bottom border-secondary pb-3">NNM Blog</h1>
        <div className="row">
            <div className="col-md-8">
                <div className="mb-5">
                    <h2 className="text-white">Future of Digital Names</h2>
                    <p className="text-secondary">Lorem ipsum dolor sit amet...</p>
                    <button className="btn btn-sm btn-outline-warning">Read More</button>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}

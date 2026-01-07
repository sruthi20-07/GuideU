import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "./firebase";

const TABS = [
  { label: "All", value: "all" },
  { label: "Certifications", value: "certification" },
  { label: "Courses", value: "course" },
  { label: "Platforms", value: "platform" },
  { label: "Resumes", value: "resume" },
  { label: "Prep Tips", value: "exam_prep" }
];

function Resources() {
  const [resources, setResources] = useState([]);
  const [activeTab, setActiveTab] = useState("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchResources = async () => {
      try {
        const snapshot = await getDocs(collection(db, "resources"));
        const data = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setResources(data);
      } catch (error) {
        console.error("Failed to load resources:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchResources();
  }, []);

  const filteredResources =
    activeTab === "all"
      ? resources
      : resources.filter(r => r.type === activeTab);

  return (
    <div className="section">
      <h2>Learning Resources</h2>

      <div className="tabs">
        {TABS.map(tab => (
          <button
            key={tab.value}
            className={activeTab === tab.value ? "tab active" : "tab"}
            onClick={() => setActiveTab(tab.value)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {loading ? (
        <p>Loading resources...</p>
      ) : filteredResources.length === 0 ? (
        <p>No resources available.</p>
      ) : (
        filteredResources.map(res => (
          <div className="card" key={res.id}>
            <h3>{res.title}</h3>
            <p><strong>Category:</strong> {res.type}</p>
            <p><strong>Recommended by:</strong> {res.recommendedBy}</p>
            {res.description && <p>{res.description}</p>}

            {res.link && (
              <a href={res.link} target="_blank" rel="noreferrer">
                Open Resource →
              </a>
            )}
          </div>
        ))
      )}
    </div>
  );
}

export default Resources;

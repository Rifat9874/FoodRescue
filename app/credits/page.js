import Link from "next/link";
import { GALLERY } from "@/lib/gallery";

export const metadata = { title: "Photo credits" };

export default function CreditsPage() {
  const credited = GALLERY.filter((image) => image.credit);
  return (
    <main className="container page">
      <div className="page-header">
        <h1>Photo credits</h1>
        <p>Food photos in the gallery come from Wikimedia Commons under free licences.</p>
      </div>
      {credited.length === 0 ? (
        <div className="empty">
          <h3>Illustrated gallery</h3>
          <p>The gallery currently uses original FoodRescue illustrations, so no photo credits are needed.</p>
          <Link className="btn" href="/food">Browse food</Link>
        </div>
      ) : (
        <div className="table-wrap">
          <table>
            <thead><tr><th>Photo</th><th>Image</th><th>Author</th><th>Licence</th></tr></thead>
            <tbody>
              {credited.map((image) => (
                <tr key={image.id}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <td style={{ width: 110 }}><img src={image.src} alt={image.label} style={{ width: 96, borderRadius: 8 }} /></td>
                  <td><a href={image.credit.source} target="_blank" rel="noreferrer">{image.credit.title}</a></td>
                  <td>{image.credit.author}</td>
                  <td>{image.credit.license}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}

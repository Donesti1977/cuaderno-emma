// Extrae el texto de un PDF con PDFKit (macOS).
//
// Uso:
//   swiftc -O extractor.swift -o extractor
//   ./extractor archivo.pdf > archivo.txt
//
// Se compila una vez y sirve para todos los PDFs. Los .txt de esta carpeta
// se generaron con este mismo programa.

import Foundation
import PDFKit

guard CommandLine.arguments.count > 1 else {
    FileHandle.standardError.write("uso: extractor <archivo.pdf>\n".data(using: .utf8)!)
    exit(2)
}

let path = CommandLine.arguments[1]
guard let doc = PDFDocument(url: URL(fileURLWithPath: path)) else {
    FileHandle.standardError.write("no se pudo abrir el PDF\n".data(using: .utf8)!)
    exit(1)
}

print("[paginas: \(doc.pageCount)]")
for i in 0..<doc.pageCount {
    guard let page = doc.page(at: i), let text = page.string else { continue }
    print("\n===== PAGINA \(i + 1) =====\n")
    print(text.replacingOccurrences(of: "\u{00a0}", with: " "))
}

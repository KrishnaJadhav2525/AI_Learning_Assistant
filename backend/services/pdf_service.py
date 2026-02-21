import io
import PyPDF2

def extract_text_from_pdf(file_bytes: bytes) -> str:
    """Extracts all text content from the bytes of a PDF file using PyPDF2."""
    try:
        pdf_reader = PyPDF2.PdfReader(io.BytesIO(file_bytes))
        
        if pdf_reader.is_encrypted:
            raise ValueError("Cannot extract text from an encrypted PDF")
            
        full_text = []
        for page_num in range(len(pdf_reader.pages)):
            page = pdf_reader.pages[page_num]
            text = page.extract_text()
            if text:
                full_text.append(text)
                
        return "\n".join(full_text)
    except Exception as e:
        raise ValueError(f"Failed to extract text from PDF: {str(e)}")

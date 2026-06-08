using System;

namespace API.interfaces;
using CloudinaryDotNet.Actions;


public interface IPhotoService
{
     Task <ImageUploadResult> AddPhotoAsync (IFormFile file) ;
 Task <DeletionResult> DeletePhotoAsync (string PublicId);
}

import { IsNotEmpty, IsIn, IsString } from 'class-validator';
import { MediaTypesEnum } from '../../common/enums/media-types.enum';

export class GetDownloadUrlDto {
  @IsNotEmpty()
  @IsIn([MediaTypesEnum.AUDIO, MediaTypesEnum.VIDEO])
  mediaType!: string;

  @IsNotEmpty()
  @IsString()
  key!: string;
}

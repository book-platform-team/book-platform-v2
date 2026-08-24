<?php

namespace App\Filament\Resources\Authors\Schemas;

use Filament\Forms\Components\FileUpload;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Textarea;
use Filament\Schemas\Schema;

class AuthorForm
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->components([
                TextInput::make('name')->label('الاسم')->required(),
                TextInput::make('slug')->label('الرابط (slug)')->required(),

                Select::make('title')
                    ->label('اللقب')
                    ->options([
                        'none' => 'بلا لقب',
                        'professor' => 'أستاذ',
                        'doctor' => 'دكتور',
                        'researcher' => 'باحث',
                    ])
                    ->default('none')
                    ->required(),

                Textarea::make('bio')->label('السيرة الذاتية')->required()->columnSpanFull(),

                FileUpload::make('photo')->label('الصورة')->disk('public')->image(),

                TextInput::make('phone')->label('الهاتف (خاص)')->tel(),
                TextInput::make('address')->label('العنوان (خاص)'),
                Textarea::make('extra')->label('ملاحظات إضافية (خاصة)')->columnSpanFull(),
            ]);
    }
}
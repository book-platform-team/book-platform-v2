<?php

namespace App\Filament\Resources\Submissions\Schemas;

use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Textarea;
use Filament\Forms\Components\FileUpload;
use Filament\Schemas\Schema;

class SubmissionForm
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->components([
                TextInput::make('author_name')->label('اسم المؤلف')->disabled(),
                TextInput::make('author_title')->label('اللقب')->disabled(),
                TextInput::make('author_email')->label('البريد')->disabled(),
                TextInput::make('author_phone')->label('الهاتف')->disabled(),
                TextInput::make('author_address')->label('العنوان')->disabled(),
                Textarea::make('author_bio')->label('السيرة')->columnSpanFull()->disabled(),

                TextInput::make('book_title')->label('عنوان الكتاب')->disabled(),
                Textarea::make('book_description')->label('الوصف')->columnSpanFull()->disabled(),
                TextInput::make('pages')->label('الصفحات')->disabled(),
                TextInput::make('legal_deposit')->label('الإيداع القانوني')->disabled(),

                FileUpload::make('cover')->label('الغلاف')->disk('public')->disabled(),

                TextInput::make('price_print')->label('سعر الطباعة')->disabled(),
                TextInput::make('price_digital')->label('السعر الرقمي')->disabled(),
                TextInput::make('sale_email')->label('بريد البيع')->disabled(),

                TextInput::make('status')->label('الحالة')->disabled(),
            ]);
    }
}
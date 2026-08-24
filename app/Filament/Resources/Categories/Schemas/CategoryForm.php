<?php

namespace App\Filament\Resources\Categories\Schemas;

use App\Models\Category;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Toggle;
use Filament\Schemas\Schema;

class CategoryForm
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->components([
                TextInput::make('name')->label('الاسم')->required(),
                TextInput::make('slug')->label('الرابط (slug)')->required(),
                TextInput::make('icon')->label('اسم الأيقونة (Boxicons)')->placeholder('bx-book'),

                Select::make('parent_id')
                    ->label('القسم الأب')
                    ->options(fn () => Category::whereNull('parent_id')->pluck('name', 'id'))
                    ->searchable()
                    ->placeholder('— قسم رئيسي (بلا أب) —'),

                Toggle::make('is_fallback')->label('هذا قسم "أخرى" (يُرتَّب أخيراً دائماً)'),
            ]);
    }
}